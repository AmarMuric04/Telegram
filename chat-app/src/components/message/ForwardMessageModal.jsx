import cat from "../../assets/undraw_cat_lqdj.svg";
import { useDispatch, useSelector } from "react-redux";
import {
  resetMessage,
  setForwardedChat,
  setIsSelecting,
} from "../../store/redux/messageSlice";
import { closeModal } from "../../store/redux/modalSlice";
import { CrossSVG } from "../../../public/svgs";
import Modal from "../modal/Modal";
import AsideChat from "../aside/AsideChat";

export default function ForwardMessageModal() {
  const dispatch = useDispatch();

  const { activeChat, userChats } = useSelector((state) => state.chat);

  return (
    <Modal extraClasses="w-[30rem]" id="forward-to-channels">
      <div className=" theme-text-2 flex gap-4 items-center">
        <button
          onClick={() => {
            dispatch(closeModal());
            dispatch(resetMessage());
          }}
          className="theme-hover-bg-2 cursor-pointer transition-all p-2 rounded-full"
        >
          <CrossSVG />
        </button>
        <h1 className="font-semibold text-xl">Forward to</h1>
      </div>
      {userChats?.length === 1 && (
        <div className="flex py-20 items-center justify-center flex-col gap-2 h-full w-ful">
          <img className="w-1/2" src={cat} alt="No chats available" />
          <p className="theme-text-2 text-sm font-semibold">
            You are not in any chats yet
          </p>
          <p className="theme-text-2 text-xs">
            Try searching for one or check out all the chats
          </p>
        </div>
      )}
      {userChats.map((chat) => {
        if (chat?._id === activeChat?._id) return;
        return (
          <AsideChat
            key={chat._id}
            action={() => {
              dispatch(setForwardedChat(chat));
              dispatch(closeModal());
              dispatch(setIsSelecting(false));
            }}
            chat={chat}
          />
        );
      })}
    </Modal>
  );
}
