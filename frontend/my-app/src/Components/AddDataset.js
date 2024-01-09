import React, {useState} from "react"
import axios from "axios";

function AddDataset() {
	const [datasetID, setDatasetID] = useState("");
	const [kind, setKind] = useState("sections");
	const [zipFileData, setZipFileData] = useState(undefined);

	const handleAddDatasetClick = async () => {
		const serverUrl = "http://localhost:4321";
		const endpointUrl = `/dataset/${datasetID}/${kind}`;
		const url = serverUrl + endpointUrl;
		try {
			const res = await axios.put(url, zipFileData, {
				headers: {
					"Content-Type": "application/x-zip-compressed",
				},
			});
			console.log(res);
			alert(`Successfully added ${datasetID}!`);
		} catch (error) {
			alert(`ERROR ADDING: ${error}`);
		}
	};

	const handleFileChange = (e) => {
		setZipFileData(e.target.files[0]);
	}

	return (
		<div className="addDataset">
			<h1>Add Dataset</h1>
			<input type="text" value={datasetID} placeholder="Enter dataset ID"
				   onChange={(e) => setDatasetID(e.target.value)}/>
			<input type="file"
					onChange={handleFileChange}/>
			<select id="kind" onChange={(e)=> setKind(e.target.value)}>
				<option value="sections">Kind: Sections</option>
				<option value="rooms">Kind: Rooms</option>
			</select>
			<button onClick={handleAddDatasetClick}>Add Dataset!</button>
		</div>
	)
}

export default AddDataset;
