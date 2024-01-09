import './App.css';
import {BrowserRouter as Router, Routes, Route} from "react-router-dom";
import Sidebar from "./Components/Sidebar";
import AddDataset from "./Components/AddDataset";
import RemoveDataset from "./Components/RemoveDataset";
import ListDataset from "./Components/ListDataset";
import Coordinator from "./Components/Coordinator";
import Student from "./Components/Student";
import TopBar from "./Components/TopBar";

function App() {
    return (
			<div className="App">
			<Router>
				<TopBar />
				<div className="main-container">
					<Sidebar />
					<div className="content">
						<Routes>
							<Route path="/addDataset" element={<AddDataset />} />
							<Route path="/removeDataset" element={<RemoveDataset />} />
							<Route path="/listDataset" element={<ListDataset />} />
							<Route path="/student" element={<Student />} />
							<Route path="/coordinator" element={<Coordinator />} />
						</Routes>
					</div>
				</div>
			</Router>
		</div>
    );
}

export default App;
