import "./chat.css"
import EmojiPicker from "emoji-picker-react"
import {useEffect, useState, useRef} from "react";
import { arrayUnion, doc, getDoc, onSnapshot, updateDoc } from "firebase/firestore";
import {db} from "../../lib/firebase";
import { useChatStore } from "../../lib/chatstore";
import { useUserStore } from "../../lib/userstore";
import upload from "../../lib/upload";

const Chat=() => {
    const [open, setopen]=useState(false);
    const [text, settext]= useState("");
    const [chat, setchat]= useState();
    const [img, setImg]= useState({
        file: null,
        url: "",

    });
    const [imgdalo, setimgdalo]=useState(false);

    const {currentUser} = useUserStore();
    const {chatId, user, isCurrentUserBlocked, isReceiverBlocked} = useChatStore();

    const endRef = useRef(null);

    useEffect(()=>{
        endRef.current?.scrollIntoView({behavior: "smooth"})
    },[]

    );

    useEffect(() =>{
        const unSub = onSnapshot(doc(db, "chats", chatId), (res) =>{
            setchat(res.data());
        }
    );

    return () =>{
        unSub();
    };
    }, [chatId]);

    // console.log(chat)

    const handleEmoji= e=> {
        settext((prev)=> prev+e.emoji);
        setopen(flase);
    };

    const handleImg= (e) =>{

       
        if(e.target.files[0]){
            setImg({
                file:e.target.files[0],
                url: URL.createObjectURL(e.target.files[0])
            })
            
        }
        
    };


    const handleSend= async ()=>{
        if(text=== "") return;

        let imgUrl=null;

        try {

            if(img.file){
                imgUrl= await upload(img.file);
            }

            await updateDoc(doc(db, "chats", chatId),{
                messages: arrayUnion({
                    senderId: currentUser.id,
                    text,
                    createdAt: new Date(),
                    ...(imgUrl && {img: imgUrl}),
                }),
            });

            const userIDs= [currentUser.id, user.id];

            userIDs.forEach(async (id) => {

            const userChatsRef= doc(db, "userchats", id)
            const userChatsSnapshot= await getDoc(userChatsRef)

            if(userChatsSnapshot.exists()){
                const userChatsData = userChatsSnapshot.data()

                const chatIndex = userChatsData.chats.findIndex(
                    (c)=> c.chatId=== chatId
                );

                userChatsData.chats[chatIndex].lastMessage= text;
                userChatsData.chats[chatIndex].isSeen= id===currentUser.id ? true : false ;
                userChatsData.chats[chatIndex].updatedAt= Date.now();

                await updateDoc(userChatsRef, {
                    chats: userChatsData.chats,
                }

                );
            }
        });
            
        } catch (err) {
            console.log(err);
        }

        setImg({
            file: null,
            url:""
        })

        settext("");
    }

    




    return (
        <div className='chat'>
            <div className="top">
                <div className="user">
                    <img src={user?.avatar || "./avatar.png"} />

                    <div className="texts">
                        <span>{user?.username}</span>
                        <p>Online</p>
                    </div>
                </div>
                <div className="icons">
                <img src="./phone.png" />
                <img src="./video.png" />
                <img src="./info.png" />
                </div>
            </div>
            <div className="center">
                 

                { chat?.messages?.map(message=>(

                <div className={message.senderId=== currentUser?.id ? "message own" : "message"} key={message?.createAt}>
               
              
                    <div className="texts">
                   {message.img && <img src={message.img} /> }
                        <p>
                            {message.text}
                        </p>
                        <span>
                        
                        </span>
                    </div>
                </div>
                )) 

                }

                {img.url && (<div className="message own">
                    <div className="texts">
                        <img src={img.url} alt="" />
                    </div>
                </div>
            )}
 
                <div ref={endRef}>

                </div>
            </div>
            <div className="bottom">
                <div className="icons">
                    <label htmlFor="file">

                  
                <img src="./img.png" />
                </label> 
                <input type="file" id="file" style={{display: "none"}} onChange={handleImg} />
                <img src="./camera.png" />
                <img src="./mic.png" />
                </div>

                <input type="text" placeholder={(isCurrentUserBlocked || isReceiverBlocked) ? "Cannot Send message!" : "Type a message..."}
                 value={text}
                  onChange={(e)=> settext(e.target.value)}
                  disabled={isCurrentUserBlocked || isReceiverBlocked}
                  />
                <div className="emoji">
                    <img src="./emoji.png" onClick={()=> setopen((prev)=> !prev) } />
                    
                    <div className="picker">
                    <EmojiPicker open={open} onEmojiClick={handleEmoji} />
                    </div>
                </div>
                <button className="Sendbutton" onClick={handleSend} disabled={isCurrentUserBlocked || isReceiverBlocked}>Send</button>
            </div>
        </div>
    )
}

export default Chat;