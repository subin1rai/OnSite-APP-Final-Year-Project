from flask import Flask, request, jsonify
import joblib
import numpy as np
import pandas as pd

app = Flask(__name__)

# Load the trained model
model = joblib.load("house_price_model.pkl")

feature_columns = [
    "LAND AREA", "ROAD ACCESS", "CARS", "BIKES",
    "LOCATION_XYZ", "LOCATION_ABC", "LOCATION_DEF",  
    "FACING_East", "FACING_North", "FACING_West"]

@app.route("/predict", methods=["POST"])
def predict():
    try:
        data = request.json
        input_data = pd.DataFrame([data], columns=feature_columns)
        prediction = model.predict(input_data).tolist()
        
        return jsonify({"predicted_price": prediction[0]})
    except Exception as e:
        return jsonify({"error": str(e)}), 400

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
