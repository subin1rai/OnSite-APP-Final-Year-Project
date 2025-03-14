const axios = require("axios");
const predictModel = async (req, res) => {
    try {
        const response = await axios.post("http://0.0.0.0:5000/predict", req.body);
        console.log(response);
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports= {
    predictModel
}
