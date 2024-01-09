import React, {useState} from "react"
import axios from "axios";

function ListDataset() {
	const [datasetList, setDatasetList] = useState([]);

	const handleListDatasetClick = async () => {
		const serverUrl = "http://localhost:4321";
		const endpointUrl = "/datasets";
		const url = serverUrl + endpointUrl;
		try {
			const res = await axios.get(url);
			setDatasetList(res.data.result);
			console.log(res);
		} catch (error) {
			alert(`ERROR LISTING: ${error}`);
		}
	};

	return (
		<div className="listDataset">
			<h1>List Dataset</h1>
			<button onClick={handleListDatasetClick}>List Dataset!</button>
			<table>
				<thead>
				<tr>
					<th>ID</th>
					<th>Kind</th>
					<th>Number of Rows</th>
				</tr>
				</thead>
				<tbody>
				{datasetList.map((dataset) => (
					<tr key={dataset.id}>
						<td>{dataset.id}</td>
						<td>{dataset.kind}</td>
						<td>{dataset.numRows}</td>
					</tr>
				))}
				</tbody>
			</table>
		</div>
	)
}

export default ListDataset;
