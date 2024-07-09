import { useEffect, useState } from "react"
import "./chatlist.css"
import Adduser from "./adduser/adduser"
import { useUserStore } from "../../../lib/userstore";
import { doc, onSnapshot, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../../../lib/firebase";
import {useChatStore} from "../../../lib/chatstore";


const Chatlist=() => {
    const [addMode, setAddMode]= useState(false);

    const [chats, setchats]= useState([]);
    const [input, setInput] = useState("");

    const {currentUser}= useUserStore();
    const {chatId, changeChat}= useChatStore();


    useEffect(()=>{

        const unSub = onSnapshot(doc(db, "userchats", currentUser.id), async (res) => {
           const items = res.data().chats;

            const promises= items.map( async (item)=>{
                const userDocRef = doc(db, "users", item.receiverId);
                const userDocSnap = await getDoc(userDocRef);

                const user= userDocSnap.data();

                return {...item, user};

            });

            const chatData= await Promise.all(promises);

            setchats(chatData.sort((a,b)=> b.updateAt-a.updateAt));

        });

        return ()=>{
            unSub();
        };
    }, [currentUser.id] );

    const handleSelect= async (chat)=>{

        const userChats = chats.map((item)=>{
            const {user, ...rest}= item;

            return rest;
        });

        const chatInd= userChats.findIndex(
            (item) => item.chatId === chat.chatId
        );

        userChats[chatInd].isSeen= true;

        const userChatsRef= doc(db, "userchats", currentUser.id);

        try {

            await updateDoc(userChatsRef, {
                chats: userChats,
            });

            changeChat(chat.chatId, chat.user); 
            
        } catch (err) {
            console.log(err);
        }

      

    };

    const filteredChats = chats.filter((c)=>
        c.user.username.toLowerCase().includes(input.toLowerCase())
    );

    return (
        <div className='chatlist'>
            <div className="search">
                <div className="searchbar">
                    <img src="/search.png" />
                    <input type="text" placeholder="Search"
                     onChange={(e)=> setInput(e.target.value) }
                     />
                </div>
                <img src={addMode ? "./minus.png" : "./plus.png"} className="add"  onClick={()=>setAddMode(prev=>!prev)} />
                
            </div>

        {filteredChats.map((chat)=> (

            <div className="item" 
            key={chat.chatId}
            onClick={()=>handleSelect(chat)} style={
                {backgroundColor: chat?.isSeen ? "transparent" : "#5183fe",}
            }>
                <img src={chat.user.blocked.includes(currentUser.id) ? "./avatar.png" :  chat.user.avatar || "./avatar.png" }/>
                <div className="texts">
                    <span>{chat.user.blocked.includes(currentUser.id)
                     ? "User"
                     : chat.user.username}</span>
                    <p>{chat.lastMessage}</p>
                </div>
            </div>

))}

            
        {addMode && <Adduser/>}
        </div>
    );
};

export default Chatlist;