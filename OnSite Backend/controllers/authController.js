const prisma = require('../utils/prisma.js');
const bcrypt = require('bcrypt');

const signUp = async(req,res)=>{
    try {
        const {name, email,password,confirmPassword} = req.body;
        if(!name || !email || !password || !confirmPassword){
            return res.status(400).json({message:"All fields are required"});
        }

        if(password !== confirmPassword){
            return res.status(400).json({message:"Password didn't match !"});
        };

        const existingUser = await prisma.user.findFirst({
            where:{
                    email:email
            }
        });

        if(existingUser){
            return res.status(400).json({message:"User already exists"});
        }

        const salt = 10;
    
        const hashPassword = await bcrypt.hash(password,salt);

        const user = await prisma.user.create({
            data:{
                username: name,
                email: email,
                password: hashPassword
            }
        });
        res.status(201).json({message:"User created successfully",user});
    } catch (error) {
        res.status(500).json({message:"Internal server error",error:error.message});
    }
}

module.exports = {signUp};