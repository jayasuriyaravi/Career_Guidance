// import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
// import RegistrationForm from "./RegistrationForm";
// import QuestionsPage from "./QuestionsPage";

// function App() {

//   return (
//       <>
//       <Router>
//         <Routes>
//           <Route path="/" element={<RegistrationForm />} />
//           <Route path="/questions" element={<QuestionsPage />} />
//         </Routes>
//       </Router>
//       </>
//   )
// }

// export default App


import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import RegistrationPage from "./RegistrationPage";
import QuestionsPage1 from "./QuestionsPage1";

function App() {
  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={<RegistrationPage />}
        />
        <Route path="/questions" element={<QuestionsPage1 />} />
      </Routes>
    </Router>
  );
}

export default App;

