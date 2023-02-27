import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";

import ImagesUpload from "./components/ImagesUpload";

const App: React.FC = () => {
  return (
    <div className="container" style={{ width: "600px" }}>
      <div className="my-3">
        <h3>bezkoder.com</h3>
        <h4>React Typescript Multiple Images Upload</h4>
      </div>

      <ImagesUpload />
    </div>
  );
}

export default App;
