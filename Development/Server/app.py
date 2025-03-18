from flask import Flask, request, jsonify
import joblib
import numpy as np
import pandas as pd
import json

app = Flask(__name__)

# Load trained model
try:
    model = joblib.load("house_price_model.pkl")
    feature_columns = model.feature_names_in_.tolist()
except Exception as e:
    print("Error loading model:", str(e))
    feature_columns = []  

def format_rupees(value):
    """Format rupees into Lakhs or Crores with proper formatting."""
    if value < 1e5:
        return f"रु{value:,.2f}"
    elif value < 1e7:  
        return f"रु{value / 1e5:.2f} Lakh"
    elif value < 1e9:
        return f"रु{value / 1e7:.2f} Crore"
    else:
        return f"रु{value / 1e9:.2f} Billion" 



@app.route("/predict", methods=["POST"])
def predict():
    try:
        
        data = request.json
        if "body" in data:
            data = json.loads(data["body"])

        print("Received Data (Cleaned):", data)

        input_data = pd.DataFrame([data])
        print("\nInitial Input DataFrame:\n", input_data)

      
        for col in input_data.columns:
            if col.startswith("LOCATION_") and input_data[col].iloc[0] == 1:
                input_data[col] = True
            elif col.startswith("LOCATION_"):
                input_data[col] = False
      
        missing_cols = [col for col in feature_columns if col not in input_data.columns]
        if missing_cols:
            print("\nMissing Features:", missing_cols)
            defaults = pd.DataFrame(0, index=input_data.index, columns=missing_cols)
            input_data = pd.concat([input_data, defaults], axis=1)

        input_data = input_data[feature_columns] 
        prediction_log = model.predict(input_data)[0]
        formatted_price = format_rupees(prediction_log)

        return jsonify({"predicted_price": formatted_price})

    except Exception as e:
        print("\nError:", str(e))
        return jsonify({"error": str(e)}), 400

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
