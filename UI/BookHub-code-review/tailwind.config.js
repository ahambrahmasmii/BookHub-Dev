/** @type {import('tailwindcss').Config} */
export default {
  content: [
    // "./src/.jsx",
    "./index.html",
    "./src/App.jsx",
    "./src/components/Test.jsx",
    "./src/components/Upload_Book_Modal.jsx",
    "./src/components/AddBook.jsx",
    "./src/components/AddResourceToCollection.jsx",
    "./src/components/CreateCollection.jsx",




    "./src/pages/Signin.jsx",
    "./src/pages/Signup.jsx",
    "./src/pages/Hero.jsx",
    "./src/pages/DisplayBooks.jsx",
    "./src/pages/Collection.jsx",
    "./src/pages/BorrowBook.jsx",
    



    "./src/components/Sidebar.jsx",
    "./src/components/Navbar.jsx",





    
  ],
  theme: {
    extend: {
      maxWidth: {
        '8xl': '1920px',
      }
    }
  },
  plugins: [],
}