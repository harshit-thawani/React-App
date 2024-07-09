import { arrayRemove, arrayUnion, doc, updateDoc } from "firebase/firestore";
import { useChatStore } from "../../lib/chatstore"
import { auth, db } from "../../lib/firebase"
import { useUserStore } from "../../lib/userstore";
import "./detail.css"

const Detail=() => {

    const {chatId, user, isCurrentUserBlocked, isReceiverBlocked, changeBlock}= useChatStore();
    const {currentUser}= useUserStore();

    const handleBlock = async () =>{
        if(!user) return;

        const userDocRef= doc(db, "users", currentUser.id)

        try {
            await updateDoc(userDocRef,{
                blocked: isReceiverBlocked ? arrayRemove(user.id) : arrayUnion(user.id),
            });

            changeBlock()
            
        } catch (err) {
            console.log(err);
            
        }
    };

    return (
        <div className='detail'>
            <div className="user">
                <img src={user?.avatar || "./avatar.png"} />
                <h2>
                    {user?.username}
                </h2>
                <p>
                    Hey there!!
                </p>
            </div>

            <div className="info">
                <div className="option">
                    <div className="title">
                        <span>
                            Chat Settings
                        </span>
                        <img src="./arrowUp.png" />
                    </div>
                </div>

                <div className="option">
                    <div className="title">
                        <span>
                            Privacy & help
                        </span>
                        <img src="./arrowUp.png" />
                    </div>
                </div>

                <div className="option">
                    <div className="title">
                        <span>
                            Shared Photos
                        </span>
                        <img src="./arrowUp.png" />
                    </div>
                </div>

                <div className="option">
                    <div className="title">
                        <span>
                            Shared Files
                        </span>
                        <img src="./arrowUp.png" />
                    </div>
                </div>
                <button onClick={handleBlock}>
                    {
                        isCurrentUserBlocked ? "You are Blocked!!" : isReceiverBlocked ? "User Blocked!" : "Block"
                    }
                </button>
                <button className="logout" onClick={()=>auth.signOut()}>LogOut</button>
            </div>
        </div>
    )
}

export default Detail