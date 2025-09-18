import { faArrowDown, faArrowUp, faX } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import _, { set } from "lodash";
import Mark from "mark.js";
import React, { useEffect, useRef, useState } from "react";

const InChatSearchDropdown = ({
    onClose, chatRef

}) => {
    const modalRef = useRef();
    const inputRef = useRef();
    const [totalMatches, setTotalMatches] = useState(0);
    const [currentMatchIndex, setCurrentMatchIndex] = useState(0);
    const instance = new Mark(chatRef.current);
    const context = chatRef.current;

    useEffect(() => {
    const handleEnter = (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            prevNextSearch("next");
        }
    };
    const handleEscape = (e) => {
        if (e.key === "Escape") onClose();
    };
    
    const handleClickOutside = (e) => {
        if (modalRef.current && !modalRef.current.contains(e.target)) {
            instance.unmark();
            onClose();
        }
    };
    
    window.addEventListener("keydown", handleEscape);
    window.addEventListener("keydown", handleEnter);
  
    window.addEventListener("mousedown", handleClickOutside);

    return () => {
        window.removeEventListener("keydown", handleEscape);
          window.removeEventListener("keydown", handleEnter);
        window.removeEventListener("mousedown", handleClickOutside);
    };
    }, [onClose]);


    const handleSearch = _.debounce(() => {
        const searchTxt = inputRef.current.value;
        // const context = chatRef.current;
        // if (!context) return;

        // const instance = new Mark(context);
        instance.unmark(); // remove old highlights

        if (searchTxt.trim() !== "") {
            instance.mark(searchTxt, {
                separateWordSearch: true,
                className: "bg-yellow-300",
                done: () => { // after marking is done
                    //  focus first match
                    const firstMark = context.querySelector("mark"); // get first mark
                    if (firstMark) {
                        firstMark.classList.add("current-highlight"); // add class to first mark
                        firstMark.scrollIntoView({ behavior: "smooth", block: "center" });
                    }
                    runSetTotalMatches();
                }
            });
        }
    }, 300);
    const runSetTotalMatches = () => {
        
        if (!context) return;
        const marks = context.querySelectorAll("mark");
        setTotalMatches(marks.length);

    }
    const prevNextSearch = (direction) => {
       
        if (!context) return;
        // const instance = new Mark(context);
        const marks = context.querySelectorAll("mark");
        if (marks.length === 0) return;
        // setTotalMatches(marks.length);
        let currentIndex = -1;
        marks.forEach((mark, index) => {
            if (mark.classList.contains("current-highlight")) {
                currentIndex = index;
                mark.classList.remove("current-highlight");
            }
        });

        if (direction === "next") {
            setCurrentMatchIndex((prev) => (prev + 1) % marks.length);
            currentIndex = (currentIndex + 1) % marks.length;
        } else if (direction === "prev") {
            setCurrentMatchIndex((prev) => (prev - 1 + marks.length) % marks.length);
            currentIndex = (currentIndex - 1 + marks.length) % marks.length;
        }

        marks[currentIndex].classList.add("current-highlight");
        marks[currentIndex].scrollIntoView({ behavior: "smooth", block: "center" });
    };
    return (
        <>



            <div className="fixed top-20  left-1/2 z-50 flex items-center justify-center ">
                <div
                    ref={modalRef}
                    className="  rounded-lg   w-full max-w-md relative"
                >
                    <div className="flex items-center bg-white gap-2 relative"> 
                        <input ref={inputRef} type="text" onChange={handleSearch} placeholder="Search in chat..."
                            className="w-full bg-white p-2 focus:outline-none focus:ring-1 focus:ring-gray-100 " />
                        <div className="flex items-center  gap-1 ">

                        {
                            <span className="text-sm text-gray-600">
                                {totalMatches > 0 ? currentMatchIndex + 1 + "/" + totalMatches : "0/0"}
                            </span>
                        }
                            <span className="partition-x-5 border-l border-gray-400 h-5 mx-2">
                                
                            </span>
                        <FontAwesomeIcon icon={faArrowDown} onClick={() => prevNextSearch("next")} className="text-gray-400 cursor-pointer" />
                        <FontAwesomeIcon icon={faArrowUp} onClick={() => prevNextSearch("prev")} className="text-gray-400 cursor-pointer" />
                       
                        </div>
                    </div>
                    
                </div>
            </div>




        </>

    )
};

export default React.memo(InChatSearchDropdown);
