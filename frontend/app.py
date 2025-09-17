from flask import Flask, render_template, request, jsonify
from flask_cors import CORS
import pandas as pd
import numpy as np
import os
from werkzeug.utils import secure_filename
import joblib
from io import BytesIO
import re
import plotly.graph_objects as go
import json
from plotly.utils import PlotlyJSONEncoder

app = Flask(__name__)
CORS(app) 
app.config['UPLOAD_FOLDER'] = 'uploads'
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024

ALLOWED_EXTENSIONS = {'xlsx', 'xls'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def load_model_and_scaler():
    try:
        model = joblib.load('nonsmotemodel.joblib')
        return model
    except FileNotFoundError as e:
        print(f"File not found: {e}")
        return None
    except Exception as e:
        print(f"Error loading model or scaler: {e}")
        return None

def extract_formula_value(cell_value):
    if isinstance(cell_value, str) and cell_value.startswith('='):
        numbers = re.findall(r'\d+\.?\d*', cell_value)
        if numbers:
            return float(numbers[0])
    return cell_value

def convert_to_python_types(data):
    if isinstance(data, (np.integer, np.int64)):
        return int(data)
    elif isinstance(data, (np.floating, np.float64)):
        return float(data)
    elif isinstance(data, dict):
        return {k: convert_to_python_types(v) for k, v in data.items()}
    elif isinstance(data, list):
        return [convert_to_python_types(item) for item in data]
    elif isinstance(data, np.ndarray):
        return data.tolist()
    else:
        return data

def process_academics_file(file):
    try:
        df = pd.read_excel(BytesIO(file.read()), engine='openpyxl')
        subject_names = []
        
        if len(df.columns) >= 4:
            subject_names = df.columns[1:4].tolist()
        
        total_marks_row = None
        for i, row in df.iterrows():
            if any('total' in str(cell).lower() for cell in row if pd.notnull(cell)):
                total_marks_row = i
                break
        
        if total_marks_row is None:
            total_marks_row = len(df) - 1

        marks = {}
        subject_details = {}
        
        for j, subject in enumerate(subject_names, 1):
            if j < len(df.columns):
                mark_value = df.iloc[total_marks_row, j]
                marks[f'mark{j}'] = extract_formula_value(mark_value)
                subject_details[subject] = extract_formula_value(mark_value)
        
        marks = convert_to_python_types(marks)
        subject_details = convert_to_python_types(subject_details)
        
        return {'marks': marks, 'subject_details': subject_details}, None
        
    except Exception as e:
        return None, f"Error processing academics file: {str(e)}"

def process_attendance_file(file):
    try:
        df = pd.read_excel(BytesIO(file.read()), engine='openpyxl')
        attendance = None
        subject_attendance = {}

        for i, row in df.iterrows():
            for cell in row:
                if isinstance(cell, str) and 'attendance' in cell.lower():
                    for j, col_name in enumerate(df.columns[1:4], 1):
                        if j < len(row):
                            cell_value = row.iloc[j] if hasattr(row, 'iloc') else row[j]
                            if pd.notnull(cell_value) and isinstance(cell_value, (int, float)):
                                subject_attendance[col_name] = cell_value
                                attendance = cell_value
                    break
        
        if not subject_attendance:
            for col in df.columns:
                if 'attendance' in str(col).lower():
                    for val in df[col]:
                        if pd.notnull(val) and isinstance(val, (int, float)):
                            attendance = val
                            break
                    break
        
        attendance = convert_to_python_types(attendance)
        subject_attendance = convert_to_python_types(subject_attendance)
        
        return {'attendance': attendance, 'subject_attendance': subject_attendance}, None
        
    except Exception as e:
        return None, f"Error processing attendance file: {str(e)}"

def process_financial_file(file):
    try:
        df = pd.read_excel(BytesIO(file.read()), engine='openpyxl')
        financial_data = {}
        fee_details = {}

        for feature in ['fee_paid_flag', 'edu_loan_flag', 'yearly_income', 'yearly_fees']:
            if feature in df.columns:
                financial_data[feature] = df[feature].iloc[0] if len(df) > 0 else None
                fee_details[feature] = df[feature].iloc[0] if len(df) > 0 else None
            else:
                for col in df.columns:
                    if feature.lower() in str(col).lower():
                        financial_data[feature] = df[col].iloc[0] if len(df) > 0 else None
                        fee_details[feature] = df[col].iloc[0] if len(df) > 0 else None
                        break
        
        financial_data = convert_to_python_types(financial_data)
        fee_details = convert_to_python_types(fee_details)
        
        return financial_data, fee_details, None
        
    except Exception as e:
        return None, None, f"Error processing financial file: {str(e)}"

def create_gauge_chart(probability, prediction):
    if prediction == "Dropout":
        color = 'red'
        title = 'Dropout Probability'
    else:
        color = 'blue'
        title = 'Non-Dropout Probability'
    
    fig = go.Figure(go.Indicator(
        mode = "gauge+number",
        value = probability * 100,
        number = {'suffix': '%', 'font': {'size': 40}},
        domain = {'x': [0, 1], 'y': [0, 1]},
        title = {'text': title, 'font': {'size': 24}},
        gauge = {
            'axis': {'range': [0, 100], 'tickwidth': 1, 'tickcolor': "darkblue"},
            'bar': {'color': color},
            'bgcolor': "white",
            'borderwidth': 2,
            'bordercolor': "gray",
            'steps': [
                {'range': [0, 30], 'color': 'lightgreen'},
                {'range': [30, 70], 'color': 'yellow'},
                {'range': [70, 100], 'color': 'orange'}],
            'threshold': {
                'line': {'color': "red", 'width': 4},
                'thickness': 0.75,
                'value': 90}}))
    
    fig.update_layout(
        height=400,
        margin=dict(l=20, r=20, t=50, b=20),
        font={'family': "Arial, sans-serif", 'color': "darkblue", 'size': 16}
    )
    
    return json.dumps(fig, cls=PlotlyJSONEncoder)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/predict', methods=['POST'])
def predict():
    try:
        if 'files' not in request.files:
            return jsonify({'success': False, 'error': 'No files uploaded'}), 400
        
        files = request.files.getlist('files')
        
        if len(files) != 3:
            return jsonify({'success': False, 'error': 'Please upload exactly 3 files'}), 400
        
        model = load_model_and_scaler()
        if model is None:
            return jsonify({'success': False, 'error': 'Model not found'}), 500
        
        all_data = {}
        student_details = {
            'subjects': {},
            'attendance': {},
            'financial': {}
        }
        errors = []
        
        for file in files:
            filename = file.filename.lower()
            
            if 'academic' in filename or 'mark' in filename:
                data, error = process_academics_file(file)
                if data:
                    all_data.update(data['marks'])
                    student_details['subjects'] = data['subject_details']
            elif 'attendance' in filename:
                data, error = process_attendance_file(file)
                if data:
                    all_data['attendance'] = data['attendance']
                    student_details['attendance'] = data['subject_attendance']
                    student_details['overall_attendance'] = data['attendance']
            elif 'financial' in filename or 'fee' in filename:
                data, fee_details, error = process_financial_file(file)
                if data:
                    all_data.update(data)
                    student_details['financial'] = fee_details
            else:
                error = f"Unknown file type: {filename}"
                data = None
            
            if error:
                errors.append(error)
        
        if errors:
            return jsonify({'success': False, 'error': "; ".join(errors)}), 400

        expected_features = ['mark1', 'mark2', 'mark3', 'attendance', 'fee_paid_flag','edu_loan_flag','yearly_income','yearly_fees']

        missing_features = [feat for feat in expected_features if feat not in all_data or all_data[feat] is None]
        if missing_features:
            return jsonify({'success': False, 'error': f"Missing features: {missing_features}"}), 400

        features_list = []
        for feat in expected_features:
            features_list.append(all_data[feat])
        
        features_array = np.array([features_list])

        prediction = model.predict(features_array)
        prediction_proba = model.predict_proba(features_array)

        prediction_text = "Dropout" if prediction[0] == 1 else "Not Dropout"
        Probability = prediction_proba[0][1] if prediction[0] == 1 else prediction_proba[0][0]
        Probability = convert_to_python_types(Probability)

        gauge_chart = create_gauge_chart(Probability, prediction_text)
        student_details = convert_to_python_types(student_details)
        
        response_data = {
            'success': True,
            'prediction': prediction_text,
            'Probability': Probability,
            'gauge_chart': gauge_chart,
            'student_details': student_details,
            'message': 'Prediction completed successfully'
        }
        
        return jsonify(response_data)
        
    except Exception as e:
        print(f"Unexpected error: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'success': False, 'error': f'Unexpected error: {str(e)}'}), 500

if __name__ == '__main__':
    if not os.path.exists(app.config['UPLOAD_FOLDER']):
        os.makedirs(app.config['UPLOAD_FOLDER'])
    
    app.run(debug=True)