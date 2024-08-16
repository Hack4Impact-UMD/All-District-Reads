import React, { useState } from "react";
import "./AddBooksForm.css";
import { db } from "../config/firebase";
import {
  getDocs,
  collection,
  addDoc,
  deleteDoc,
  updateDoc,
  doc,
  setDoc,
  writeBatch,
} from "firebase/firestore";
import { ActionCodeOperation } from "firebase/auth";
import { Icon } from "@mui/material";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";


//same thing as Library
type ChapterQuestions = {
  chapterId: string;
  chapterNumber: number;
  questions: string[];
  answers: string[];
};

type Book = {
  id: string;
  title: string;
  description?: string;
  chapters?: ChapterQuestions[];
  imageUrl?: string;
};

type AddBookFormProps = {
  book: Book;
  onSave: (bookData: Book) => void;
  onClose: () => void;
};

const AddBooksForm: React.FC<AddBookFormProps> = ({
  book,
  onSave,
  onClose,
}) => {
  const [title, setTitle] = useState(book.title); //this is the current title of the book
  const [description, setDescription] = useState(book.description || ""); //this is the description of book
  const [imageUrl, setImageUrl] = useState(book.imageUrl || ""); //this is urlImage
  const [activeBook, setActiveBook] = useState<Book | null>(null);
  const [chapters, setChapters] = useState(
    book.chapters || [
      {
        //these are chapters
        chapterId: Date.now().toString(),
        chapterNumber: 1,
        questions: [],
        answers: [],
      },
    ],
  );

  const [deleteChapters, doDeleteChapters] = useState<string[]>([]); //store ids
  const [numberOfChapters, setNumberOfChapters] = useState(
    chapters.length || 1,
  ); //number of chapters

  const [activeChapter, setExactChapter] = useState(0); //which on you're on
  //when you submit, save whatever's in useState to array and database
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    // Reference to the existing book document
    const bookRef = doc(db, "books", book.id);

    // Prepare a batch update for chapters to handle them all together
    const batch = writeBatch(db);

    // Add book update to the batch and update in array
    batch.update(bookRef, {
      title: title,
      description: description,
      imageUrl: imageUrl,
      chapters: chapters,
    });

    book.title = title;
    book.chapters = chapters;
    book.description = description;
    book.imageUrl = imageUrl;
    // Add chapter updates or creations to the batch
    chapters.forEach((chapter, index) => {
      //update them chapters
      const chapterRef = doc(
        db,
        "books",
        book.id,
        "Chapters",
        chapter.chapterId,
      );
      batch.set(
        chapterRef,
        {
          chapterNumber: chapter.chapterNumber,
          questions: chapter.questions,
          answers: chapter.answers,
        },
        { merge: true },
      ); // Use merge to not overwrite other fields
    });
    deleteChapters.forEach((chapterId) => {
      const chapterRef = doc(db, "books", book.id, "Chapters", chapterId);
      batch.delete(chapterRef); // Delete the entire chapter document
      //   console.log(`Chapter ${chapterId} marked for deletion.`);
    });

    // Commit the batch
    try {
      await batch.commit();
      doDeleteChapters([]);
      //   console.log("All updates committed successfully");
      // Optionally, call onSave with the updated book details if needed
      console.log("All updates committed successfully");
      onClose(); // This will close the form
    } catch (error) {
      //   console.error("Error committing updates: ", error);
    }
  };

  const handleChapterQuestionChange = (
    chapterIndex: number,
    question: string,
    questionIndex: number,
  ) => {
    const newChapters = [...chapters];
    // console.log(activeChapter);
    // console.log(chapterIndex);
    // console.log(newChapters);
    newChapters[chapterIndex].questions[questionIndex] = question;
    setChapters(newChapters);
  };

  const handleChapterAnswerChange = (
    chapterIndex: number,
    answer: string,
    questionIndex: number,
  ) => {
    const newChapters = [...chapters];
    newChapters[chapterIndex].answers[questionIndex] = answer;
    setChapters(newChapters);
  };

  const handleNumberOfChaptersChange = async (count: number) => {
    setNumberOfChapters(count);
    const newChapters = chapters ? [...chapters] : [];
    const diff = count - newChapters.length;
    const currLength = newChapters.length;
    const append = Date.now().toString();

    // Add the new chapter to the end of the new array
    if (diff > 0) {
      for (let i = 0; i < diff; i++) {
        const append = Date.now().toString() + i;
        const newChapterNumber = currLength + i + 1;

        newChapters.push({
          chapterId: append,
          chapterNumber: newChapterNumber,
          questions: [],
          answers: [],
        });
      }

      // Update the state with the new chapters array
    } else if (diff < 0) {
      const chaptersToRemove = newChapters.slice(count);
      newChapters.splice(count);

      const toRemove = [];
      for (const chapter of chaptersToRemove) {
        toRemove.push(chapter.chapterId);
      }
      doDeleteChapters([...deleteChapters, ...toRemove]);

      setExactChapter(count);
    }
    setChapters(newChapters);
  };

  const addQuestionToChapter = async (chapterIndex: number) => {
    // Make a shallow copy of the chapters array
    const newChapters = [...chapters];

    // Check if the chapter has a questions array, and if not, initialize it
    const updatedQuestions = [
      ...newChapters[chapterIndex].questions,
      "",
    ];
    const updatedAnswers = [...newChapters[chapterIndex].answers, ""];

    // Update the local copy of the chapters array with the new question and answer
    newChapters[chapterIndex] = {
      ...newChapters[chapterIndex],
      questions: updatedQuestions,
      answers: updatedAnswers,
    };

    // Define the Firestore document reference for the specific chapter

    setChapters(newChapters);
  };

  const deleteQuestion = async (
    chapterIndex: number,
    questionIndex: number,
  ) => {
    const newChapters = chapters.map((chapter, index) => {
      if (index === chapterIndex) {
        // Copy the chapter and modify its questions array
        return {
          ...chapter,
          questions: chapter.questions.filter(
            (_, qIndex) => qIndex !== questionIndex,
          ),
          answers: chapter.answers.filter(
            (_, aIndex) => aIndex !== questionIndex,
          ),
        };
      }
      return chapter;
    });

    setChapters(newChapters);
  };

  const handleAddBookClick = () => {
    const tempId = `temp-${Date.now()}`; // Generate a temporary unique ID
    setActiveBook({
      id: tempId,
      title: "",
      description: "",
      chapters: [],
      imageUrl: "",
    });
  };

  let activeChapterContent = chapters.find(
    (chapter) => chapter.chapterNumber === activeChapter,
  );
  return (
    <div className="add-books-form">
      <p className="edit-book-title">Edit Book</p>
      <button onClick={onClose} className="close-button">
        X
      </button>

      <form onSubmit={handleSubmit}>
        <div className="form-section">
          <label>
            Book Title:
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="form-input small-input"
              placeholder="Untitled"
            />
          </label>
          <label>
            Book Image URL:
            <input
              type="text"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="form-input small-input"
              placeholder="https://"
            />
          </label>
        </div>

        <label>
          Book Description:
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="form-textarea large-input"
            placeholder="Book description here..."
          />
        </label>
        <div className="chapter-controls">
          {/* Number of Chapters input */}
          <div className="number-of-chapters">
            <label>
              Number of Chapters:
              <input //how many
                type="number"
                value={numberOfChapters}
                onChange={(e) =>
                  handleNumberOfChaptersChange(Number(e.target.value))
                }
                className="form-input"
                onKeyDown={(e) => {
                  if (e.key === "Enter") e.preventDefault();
                }}
              />
            </label>
          </div>

          <div className="select-chapter">
            <select
              value={activeChapter}
              onChange={(e) => setExactChapter(Number(e.target.value))}
              className="form-select"
            >
              <option value="">Select Chapter</option> {/* Add this line */}
              {chapters.map((item, index) => (
                <option key={index} value={item.chapterNumber}>
                  Chapter {item.chapterNumber}
                </option>
              ))}
            </select>
          </div>
        </div>
        {activeChapterContent && (
          <div className="chapter-questions">
            <p className="chapter-heading">Chapter {activeChapterContent.chapterNumber}</p>
            {activeChapterContent.questions.map((question, questionIndex) => (
              <div key={questionIndex} className="question-item">
                <label>
                  Question {questionIndex + 1}:
                  <div className="question-delete">
                    <input
                      type="text"
                      value={question}
                      onChange={(e) =>
                        handleChapterQuestionChange(
                          activeChapter - 1,
                          e.target.value,
                          questionIndex,
                        )
                      }
                      placeholder="question"
                      className="form-input"
                    />
                    <button
                    type="button"
                    onClick={() =>
                      deleteQuestion(activeChapter - 1, questionIndex)
                    }
                    className="delete-question"
                  >
                  <DeleteOutlinedIcon style={{ fontSize: "20px" }} />
                  </button>
                </div>
                </label>
                <label>
                  Answer/Additional Notes:
                  <input
                    type="text"
                    value={activeChapterContent?.answers[questionIndex]}
                    onChange={(e) =>
                      handleChapterAnswerChange(
                        activeChapter - 1,
                        e.target.value,
                        questionIndex,
                      )
                    }
                    placeholder="answer"
                    className="form-input"
                  />
                </label>
              </div>
            ))}
            <button
              type="button"
              onClick={() => addQuestionToChapter(activeChapter - 1)}
              className="add-question"
            >
              Add Question
            </button>
          </div>
        )}
        <button
          type="submit"
          className="save-button"
          onClick={handleAddBookClick}
        >
          Publish
        </button>
      </form>
    </div>
  );
};

export default AddBooksForm;
