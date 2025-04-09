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
import SkillGapPage from "./SkillGapPage";
import Roadmap from "./Roadmap";
import SkillRoadmap from "./SkillRoadmap";

function App() {
  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={<RegistrationPage />}
        />
        <Route path="/questions" element={<QuestionsPage1 />} />
        <Route path="/skill-gap" element={<SkillGapPage />} />
        <Route path="/roadmap" element={<Roadmap />} />
        <Route path="/roadmap/:skillName" element={<SkillRoadmap />} />
      </Routes>
    </Router>
  );
}

export default App;

