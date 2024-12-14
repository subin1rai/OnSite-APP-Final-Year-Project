const transaction = async (req, res) => {
  const { transaction_name, amount,vendor_id, remark } = req.body;
  const { id } = req.params;

  try {
    if(vendor_id) return;
    // const project  




  } catch (error) {
    console.log(error.message);
  }
  


};
module.export = {
  transaction,
};
