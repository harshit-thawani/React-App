import "./login.css";
import { useState } from "react";
import { toast } from "react-toastify";
import { createUserWithEmailAndPassword , signInWithEmailAndPassword} from "firebase/auth";
import { auth, db } from "../../lib/firebase";
import {doc, setDoc} from "firebase/firestore";
import upload from "../../lib/upload";

const Login = ()=>{

    const [avatar, setavatar]= useState(
        {
            file:null,
            url:"",
        }
    );

    const [loading, setloading]=useState(false);  

    const handleavatar= (e) =>{

       
        if(e.target.files[0]){
            setavatar({
                file:e.target.files[0],
                url: URL.createObjectURL(e.target.files[0])
            })
            
        }
        
    };

    const handleRegister= async (e) =>{
        e.preventDefault();
        setloading(true)
        const formData=new FormData(e.target);

        const {username, email, password} = Object.fromEntries(formData);
        
        try {
            const res= await createUserWithEmailAndPassword(auth, email, password);

            const imgUrl= await upload(avatar.file)

            await setDoc(doc(db, "users", res.user.uid), {
                username,
                email, 
                avatar:imgUrl,
                id: res.user.uid,
                blocked: [], 
              });

              await setDoc(doc(db, "userchats", res.user.uid), {
                chats:[],
              });

             toast.success("Account created !!");
            
        } catch (err) {
            console.log(err)
         toast.error(err.message);
        } finally{
            setloading(false);
        }
    };

    const handleLogin= async (e) =>{
        e.preventDefault();
        setloading(true);

        const formData=new FormData(e.target);

        const { email, password} = Object.fromEntries(formData);

        try {
            await signInWithEmailAndPassword(auth, email, password);
            
        } catch (err) {
            console.log(err);
            toast.error(err.message);
        } finally{
            setloading(false);
        }
    }
  return (
    <div className="login">
       <div className="item">
        <h2>Welcome Back</h2>
        <form onSubmit={handleLogin}>
            <input type="text" placeholder="Email" name="email" />
            <input type="password" placeholder="Password" name="password" />
            <button disabled={loading}>{loading ? "Loading" : "Sign In"}</button>
        </form>
       </div>

       <div className="separator"></div>
       <div className="item">
       <h2>Create Account</h2>
        <form onSubmit={handleRegister}>
            <label htmlFor="file">
                <img src={avatar.url || "./avatar.png"} alt="" />
                Upload Image</label>

            <input type="file" id="file" style={{display:"none"}} onChange={handleavatar}/>
            <input type="text" placeholder="Username" name="username" />
            <input type="text" placeholder="Email" name="email" />
            <input type="password" placeholder="Password" name="password" />
            <button disabled={loading}>{loading ? "Loading" : "Sign Up"}</button>
        </form>

       </div>
    </div>
  )
  

  

};

export default Login;