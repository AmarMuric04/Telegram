import { useDispatch, useSelector } from "react-redux";
import {
  setForwardedChat,
  setIsSelecting,
  setMessage,
  setMessageType,
  setSelected,
} from "../../store/redux/messageSlice";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { openModal } from "../../store/redux/modalSlice";
import { useMutation } from "@tanstack/react-query";
import {
  closeContextMenu,
  openContextMenu,
} from "../../store/redux/contextMenuSlice";
import { LightbulbSVG, ReplySVG } from "../../../public/svgs";
import CircleCheckbox from "../misc/CircleCheckbox";
import PollOptionsList from "../poll/PollOptionsList";
import MessageContextMenu from "./MessageContextMenu";
import { protectedPostData } from "../../utility/async";

export default function Message({
  message,
  isMe,
  showImage,
  showSenderInfo,
  messageId,
  isAdmin,
  onOpenPicker,
  addReaction,
}) {
  const dispatch = useDispatch();
  const [isHovering, setIsHovering] = useState(false);
  const [votes, setVotes] = useState([]);
  const { isSelecting, selected } = useSelector((state) => state.message);
  const { user } = useSelector((state) => state.auth);
  const { open } = useSelector((state) => state.contextMenu);
  const { activeChat } = useSelector((state) => state.chat);

  useEffect(() => {
    if (!isSelecting) dispatch(setSelected([]));
  }, [isSelecting, dispatch]);

  if (message.type === "forward" && message.message) {
    showSenderInfo = false;
  }

  if (message.extra) {
    showImage = false;
  }

  const handleReactionClick = (event) => {
    event.preventDefault();
    onOpenPicker(event, message);
  };

  const isSelected = selected.some((s) => s._id === message._id);

  const handleContextMenu = (e) => {
    e.preventDefault();

    const menuHeight = 320;
    const screenHeight = window.innerHeight;

    let x = e.clientX;
    let y = e.clientY;

    if (y + menuHeight > screenHeight) {
      y = screenHeight - menuHeight;
    }

    dispatch(closeContextMenu());

    setTimeout(() => {
      dispatch(openContextMenu({ message, x, y }));
    }, 0);
  };

  const token = localStorage.getItem("token");

  const { mutate: addVote } = useMutation({
    mutationFn: () =>
      protectedPostData(
        "/poll/add-vote",
        {
          pollId: message.poll,
          options: votes,
        },
        token
      ),
  });

  const hasVoted = message.poll?.options.some((opt) =>
    opt.voters.includes(user._id)
  );

  const totalPollVotes = message.poll?.options.reduce(
    (a, b) => (a += b.votes),
    0
  );

  const votedOptions = message.poll?.options
    .filter((opt) => opt.voters.includes(user._id))
    .map((option) => option.text);

  const isInChat = activeChat?.users?.some(
    (u) => u._id.toString() === user._id
  );

  return (
    <>
      {message.type === "system" && (
        <div className="relative z-10 text-center my-1">
          <span className="bg-[#8675DC50] text-white px-4 text-sm font-semibold rounded-full p-1">
            {message.sender.firstName}, {message.sender.lastName[0]}{" "}
            {message.message}
          </span>
        </div>
      )}
      {message.type !== "system" && (
        <div
          onDoubleClick={() => {
            dispatch(setMessage(message));
            dispatch(setMessageType("reply"));
          }}
          onClick={() => {
            setIsHovering(false);
            if (!isSelecting || open) return;

            if (isSelected) {
              const newSelected = selected.filter((s) => s._id !== message._id);
              dispatch(setSelected(newSelected));
              if (newSelected.length === 0) {
                dispatch(setIsSelecting(false));
              }
            } else dispatch(setSelected([...selected, message]));
          }}
          onContextMenu={handleContextMenu}
          onMouseOver={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
          className={`w-full flex z-10 justify-end relative ${
            isSelecting && "cursor-pointer"
          } ${isMe ? "self-end flex-row" : "self-start flex-row-reverse"}`}
          key={message._id}
        >
          {isSelecting && (
            <div className="appearAnimation absolute z-50 left-0 top-1/2 -translate-y-1/2">
              <CircleCheckbox isChecked={isSelected} id="cbx-12" />
            </div>
          )}

          <li
            id={message._id}
            className={`relative transition-all left-0 ${
              !isMe && isSelecting && "left-12"
            } z-50 appearAnimation flex gap-2 max-w-[25rem] ${
              isMe ? "self-end flex-row" : "self-start flex-row-reverse"
            } ${!showImage && !isMe && "ml-12"} ${showImage && "mb-1"}`}
          >
            <MessageContextMenu
              isAdmin={isAdmin}
              isMe={isMe}
              isSelected={isSelected}
              message={message}
            />
            {isInChat && isHovering && !isSelecting && (
              <button
                onClick={() => {
                  dispatch(openModal("forward-to-channels"));
                  dispatch(setMessageType("forward"));
                  dispatch(setMessage(message));
                  dispatch(setForwardedChat(null));
                }}
                className={`bg-[#8675DC20] hover:bg-[#8675DC80] cursor-pointer p-1 rounded-full appearAnimation z-10 transition-all absolute top-1/2 -translate-y-1/2 ${
                  isMe ? "-left-16" : "-right-16 -scale-x-100"
                }`}
              >
                <ReplySVG classes="text-white" />
              </button>
            )}
            {isInChat &&
              isHovering &&
              Object.keys(message.reactions).length <= 18 && (
                <>
                  <button
                    onClick={handleReactionClick}
                    className={`appearAnimation cursor-pointer group absolute bottom-0 ${
                      isMe ? "-left-6" : "-right-6"
                    } p-1 rounded-full theme-bg`}
                  >
                    <p className="group-hover:scale-110 group-hover:text-green-400 transition-all">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                      >
                        <rect width="24" height="24" fill="none" />
                        <path
                          fill="currentColor"
                          d="M7 9.5C7 8.67 7.67 8 8.5 8s1.5.67 1.5 1.5S9.33 11 8.5 11S7 10.33 7 9.5m5 8c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5m3.5-6.5c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8S14 8.67 14 9.5s.67 1.5 1.5 1.5M22 1h-2v2h-2v2h2v2h2V5h2V3h-2zm-2 11c0 4.42-3.58 8-8 8s-8-3.58-8-8s3.58-8 8-8c1.46 0 2.82.4 4 1.08V2.84A9.9 9.9 0 0 0 11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12c0-1.05-.17-2.05-.47-3H19.4c.38.93.6 1.94.6 3"
                        />
                      </svg>
                    </p>
                  </button>
                </>
              )}

            <div
              className={`rounded-[1.25rem] relative ${
                isMe
                  ? "bg-[#8675DC] ml-auto rounded-br-none"
                  : "theme-bg mr-auto rounded-bl-none"
              } ${!showSenderInfo && !isMe && "rounded-tl-md"} ${
                !showSenderInfo && isMe && "rounded-tr-md"
              }`}
            >
              <div>
                {showSenderInfo && !isMe && (
                  <div className="flex justify-between items-center gap-4 px-2">
                    <p className="text-sm font-semibold text-[#8675DC]">
                      {message.sender.firstName}, {message.sender.lastName[0]}
                    </p>
                    {isAdmin && <p className="theme-text-2 text-xs">admin</p>}
                  </div>
                )}
                {!isMe && (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    className="absolute -bottom-2 -left-1"
                  >
                    <g transform="rotate(160, 12, 12)">
                      <path
                        className="theme-fill-bg"
                        d="M24,12 Q12,0 0,12 Q12,24 24,12 Z"
                      />
                    </g>
                  </svg>
                )}
                {isMe && showImage && (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    className="absolute -bottom-2 -right-1"
                  >
                    <g transform="rotate(200, 12, 12)">
                      <path
                        fill="#8675DC"
                        d="M24,12 Q12,0 0,12 Q12,24 24,12 Z"
                      />
                    </g>
                  </svg>
                )}
                {message.type === "forward" && (
                  <Link
                    className={`${isSelecting && "pointer-events-none"}`}
                    to={`/${
                      message.referenceMessageId.chat?._id
                        ? message.referenceMessageId.chat?._id
                        : ""
                    }`}
                  >
                    <div
                      className={`text-sm cursor-pointer transition-all px-2 py-1 rounded-md`}
                    >
                      <p className="font-semibold">Forwarded from</p>
                      <div className="flex items-center gap-1">
                        {message.referenceMessageId.chat?.imageUrl ? (
                          <img
                            src={`${import.meta.env.VITE_SERVER_PORT}/${
                              message.referenceMessageId.chat.imageUrl
                            }`}
                            alt={message.referenceMessageId.chat.name}
                            className="min-h-6 max-h-6 min-w-6 max-w-6 rounded-full object-cover"
                          />
                        ) : (
                          <div
                            className="h-6 w-6 rounded-full text-[0.5rem] grid place-items-center font-semibold text-white"
                            style={{
                              background: message.referenceMessageId.chat
                                ? `linear-gradient(${
                                    message.referenceMessageId.chat?.gradient
                                      ?.direction
                                  }, ${message.referenceMessageId.chat?.gradient?.colors.join(
                                    ", "
                                  )})`
                                : "darkred",
                            }}
                          >
                            {message.referenceMessageId.chat
                              ? message.referenceMessageId.chat?.name?.slice(
                                  0,
                                  3
                                )
                              : "x"}
                          </div>
                        )}
                        <p>
                          {message.referenceMessageId.chat?.name
                            ? message.referenceMessageId.chat?.name
                            : "Channel deleted"}
                        </p>
                      </div>
                    </div>
                  </Link>
                )}
                {message.type === "reply" && (
                  <Link
                    className={`${isSelecting && "pointer-events-none"}`}
                    to={`/${message.chat._id}#${message.referenceMessageId._id}`}
                  >
                    <div
                      className={`mx-2 text-sm cursor-pointer transition-all ${
                        isMe
                          ? "hover:bg-[#ffffff40] bg-[#ffffff20] border-white"
                          : "hover:bg-[#8675DC40] bg-[#8675DC20] border-[#8675DC]"
                      } ${
                        isMe ? "border-l-4" : "border-r-4"
                      } px-2 py-1 rounded-md`}
                    >
                      <p className="font-semibold px-2">
                        {message.referenceMessageId.sender.firstName}
                      </p>
                      <div className="flex items-center gap-2">
                        {message.referenceMessageId.imageUrl && (
                          <img
                            className="max-h-[16px]"
                            src={`${import.meta.env.VITE_SERVER_PORT}/${
                              message.referenceMessageId.imageUrl
                            }`}
                          />
                        )}
                        {message.referenceMessageId.message
                          ? message.referenceMessageId.message
                          : "Photo"}
                        {message.referenceMessageId.type === "poll" &&
                          "📊 " + message.referenceMessageId.poll.question}
                      </div>
                    </div>
                  </Link>
                )}
                {message.type !== "forward" && message.imageUrl && (
                  <img
                    className="max-w-[25rem] max-h-[25rem] self-center mx-auto rounded-lg"
                    src={`${import.meta.env.VITE_SERVER_PORT}/${
                      message.imageUrl
                    }`}
                    alt="Message"
                  />
                )}
                {message.type === "forward" &&
                  message.referenceMessageId.imageUrl && (
                    <img
                      className="max-h-[25rem] max-w-[25rem]"
                      src={`${import.meta.env.VITE_SERVER_PORT}/${
                        message.referenceMessageId.imageUrl
                      }`}
                    />
                  )}
                {message.type === "poll" && (
                  <div className="min-w-[20rem]">
                    <p className="font-semibold">{message.poll.question}</p>
                    <div className="text-sm flex items-center w-full">
                      <p>
                        {message.poll.settings.anonymousVoting && "Anonymous"}{" "}
                        {message.poll.settings.quizMode ? " Quiz" : "Voting"}
                      </p>

                      {hasVoted && message.poll.settings.quizMode && (
                        <button
                          onClick={() => alert(message.poll.explanation)}
                          className="self-end ml-auto cursor-pointer"
                        >
                          <LightbulbSVG />
                        </button>
                      )}
                    </div>
                    <PollOptionsList
                      message={message}
                      hasVoted={hasVoted}
                      votedOptions={votedOptions}
                      totalPollVotes={totalPollVotes}
                      votes={votes}
                      setVotes={setVotes}
                      addVote={addVote}
                    />
                    {message.poll.settings.multipleAnswers && (
                      <button
                        onClick={() => addVote()}
                        className="font-semibold w-full mt-4 cursor-pointer"
                      >
                        Vote
                      </button>
                    )}
                  </div>
                )}
                <div className="flex flex-wrap justify-end items-baseline px-2 py-1">
                  {message.message &&
                    message.type !== "forward" &&
                    message.type !== "poll" && (
                      <p className="flex-grow break-words break-all">
                        {message.message}
                      </p>
                    )}
                  {message.type === "forward" && (
                    <p className="flex-grow break-words break-all">
                      {message.referenceMessageId?.type === "poll" &&
                        "📊 " + message.referenceMessageId?.poll.question}
                      {message.referenceMessageId
                        ? message.referenceMessageId.message
                          ? message.referenceMessageId.message
                          : message.message
                        : message.message}
                    </p>
                  )}
                  {message.type === "voice" && (
                    <audio
                      controls
                      src={`${import.meta.env.VITE_SERVER_PORT}${
                        message.audioUrl
                      }`}
                    />
                  )}

                  <div className="flex-shrink-0 flex gap-2 whitespace-nowrap text-xs theme-text-2 ml-2">
                    {message.edited && message.type !== "forward" && (
                      <p className="italic">edited</p>
                    )}
                    <p>
                      {new Date(message.createdAt).toLocaleString("en-US", {
                        weekday: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: false,
                      })}
                    </p>
                  </div>
                </div>
                {message.reactions &&
                  Object.keys(message.reactions).some(
                    (emoji) => message.reactions[emoji].length > 0
                  ) && (
                    <div className="mx-1 my-2 flex-wrap inline-flex">
                      {Object.entries(message.reactions)
                        .filter(([, users]) => users.length > 0)
                        .map(([emoji, users]) => (
                          <p
                            onClick={() => {
                              if (isInChat) addReaction({ emoji, message });
                            }}
                            className="py-1 px-3 m-[2px] bg-[#ffffff50] hover:bg-[#ffffff70] cursor-pointer rounded-lg"
                            key={emoji}
                          >
                            {emoji} {users.length}
                          </p>
                        ))}
                    </div>
                  )}
              </div>
            </div>
            {showImage && !isMe && (
              <img
                src={`${import.meta.env.VITE_SERVER_PORT}/${
                  message.sender.imageUrl
                }`}
                alt={`${message.sender.firstName} ${message.sender.lastName}`}
                className="w-10 h-10 rounded-full mt-1"
              />
            )}
          </li>
          {(message._id === messageId || isSelected) && (
            <div
              className={`${isSelected && "bg-[#8675DC20]"} ${
                !isSelecting && "showAnimation"
              }  absolute top-0 -left-[100rem] bg-[#8675DC50] min-w-[300rem] h-full`}
            ></div>
          )}
        </div>
      )}
    </>
  );
}

Message.propTypes = {
  message: PropTypes.object.isRequired,
  isMe: PropTypes.bool.isRequired,
  showImage: PropTypes.bool.isRequired,
  showSenderInfo: PropTypes.bool.isRequired,
  isAdmin: PropTypes.bool.isRequired,
  messageId: PropTypes.string.isRequired,
  onContextMenu: PropTypes.func.isRequired,
  onClearContextMenu: PropTypes.func.isRequired,
  onOpenPicker: PropTypes.func.isRequired,
  addReaction: PropTypes.func,
};
