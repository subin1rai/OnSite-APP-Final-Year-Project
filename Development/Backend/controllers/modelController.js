const axios = require("axios");
const predictModel = async (req, res) => {
    try {
        const response = await axios.post("https://f2h32s33-5000.inc1.devtunnels.ms/predict", req.body);
        console.log(response);
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
const constructionModel = async (req, res) => {
    try {
        const response = await axios.post("https://f2h32s33-5000.inc1.devtunnels.ms/constructionpredict", req.body);
        console.log(response);
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports= {
    predictModel,
    constructionModel
}
