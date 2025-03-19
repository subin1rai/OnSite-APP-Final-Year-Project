from flask import Flask, request, jsonify
import joblib
import pandas as pd
import json

app = Flask(__name__)

# Load models
try:
    model = joblib.load("house_price_model.pkl")
    house_feature_columns = model.feature_names_in_.tolist()
except Exception as e:
    print("Error loading house price model:", str(e))
    house_feature_columns = []

try:
    labor_model = joblib.load("LaborCostModel.pkl")
    material_model = joblib.load("MaterialCostModel.pkl")
    # Assuming the feature names for the construction model are already available
    construction_feature_columns = labor_model.feature_names_in_.tolist()  # Same features as for both models
except Exception as e:
    print("Error loading construction models:", str(e))
    construction_feature_columns = []

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
        # Parse the incoming JSON data
        data = request.get_json()

        if not data:
            return jsonify({"error": "No input data provided"}), 400

        # Check for body key and load the data accordingly
        if "body" in data:
            data = json.loads(data["body"])

        input_data = pd.DataFrame([data])

        # Ensuring all location-related features are boolean
        for col in input_data.columns:
            if col.startswith("LOCATION_") and input_data[col].iloc[0] == 1:
                input_data[col] = True
            elif col.startswith("LOCATION_"):
                input_data[col] = False

        # Handle missing columns by adding them with default value 0
        missing_cols = [col for col in house_feature_columns if col not in input_data.columns]
        if missing_cols:
            print("\nMissing Features:", missing_cols)
            defaults = pd.DataFrame(0, index=input_data.index, columns=missing_cols)
            input_data = pd.concat([input_data, defaults], axis=1)

        input_data = input_data[house_feature_columns]
        
        # Make house price prediction
        prediction_log = model.predict(input_data)[0]
        formatted_price = format_rupees(prediction_log)

        return jsonify({"predicted_price": formatted_price})

    except Exception as e:
        print("\nError:", str(e))
        return jsonify({"error": str(e)}), 400


@app.route("/constructionpredict", methods=["POST"])
def construction_predict():
    try:
        # Parse the incoming JSON data
        data = request.get_json()
        if not data:
            return jsonify({"error": "No input data provided"}), 400

        # Check for body key and load the data accordingly
        if "body" in data:
            try:
                data = json.loads(data["body"])
            except json.JSONDecodeError as e:
                return jsonify({"error": f"Invalid JSON format: {str(e)}"}), 400

        input_data = pd.DataFrame([data])

        # Handle missing columns by adding them with default value 0
        missing_cols = [col for col in construction_feature_columns if col not in input_data.columns]
        if missing_cols:
            defaults = pd.DataFrame(0, index=input_data.index, columns=missing_cols)
            input_data = pd.concat([input_data, defaults], axis=1)

        input_data = input_data[construction_feature_columns]

        # Make prediction using both models
        try:
            material_price = material_model.predict(input_data)[0]
            labor_price = labor_model.predict(input_data)[0]
            predicted_price = material_price + labor_price  # Sum of both predicted prices
        except Exception as e:
            return jsonify({"error": f"Prediction Error: {str(e)}"}), 500
        print("material cost", material_model)
        print("labor cost", labor_model)
        # Format the predicted price
        formatted_price = format_rupees(predicted_price)
        return jsonify({"construction_predicted_price": formatted_price})

    except Exception as e:
        print("Error:", str(e))
        return jsonify({"error": str(e)}), 400


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
