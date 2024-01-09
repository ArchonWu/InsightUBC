import React, {useState} from "react"
import axios from "axios";

function RemoveDataset() {
	const [datasetID, setDatasetID] = useState("");

	const handleRemoveDatasetClick = async () => {
		const serverUrl = "http://localhost:4321";
		const endpointUrl = `/dataset/${datasetID}`;
		const url = serverUrl + endpointUrl;
		try {
			const res = await axios.delete(url);
			console.log(res);
			alert(`successfully removed ${datasetID}`);
		} catch (error) {
			alert(`ERROR REMOVING: ${error}`);
		}
	};

	return (
		<div className="removeDataset">
			<h1>Remove Dataset</h1>
			<input type="text" placeholder="Enter dataset ID"
				   onChange={(e)=> setDatasetID(e.target.value)} />
			<button onClick={handleRemoveDatasetClick}>Remove dataset!</button>
		</div>
	)
}

export default RemoveDataset;
