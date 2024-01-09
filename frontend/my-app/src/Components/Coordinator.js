import React, {useEffect, useState} from "react"
import axios from "axios";

function Coordinator() {
	const [existingRoomsDatasets, setExistingRoomsDatasets] = useState([]);
	const [datasetID, setDatasetID] = useState("");
	const [furnitureType, setFurnitureType] = useState("");
	const [roomSize, setRoomSize] = useState("");
	const columnsKey =
		[datasetID+"_shortname", datasetID+"_fullname", datasetID+"_number", datasetID+"_name",
			datasetID+"_address", datasetID+"_type", datasetID+"_furniture", datasetID+"_seats",
			datasetID+"_href", datasetID+"_lat", datasetID+"_lon"];
	const [queryResults, setQueryResults] = useState([]);
	const [showResults, setShowResults] = useState(false);

	// Run only once when the Coordinator tab is selected, get all existing datasets IDs to display as a list
	useEffect(() => {
		const fetchData = async () => {
			const listDatasetUrl = "http://localhost:4321/datasets";
			try {
				const res = await axios.get(listDatasetUrl);
				const roomDatasets = res.data.result.filter((dataset) => dataset.kind === "rooms");
				const ids = roomDatasets.map((dataset) => dataset.id);
				setExistingRoomsDatasets(ids);
			} catch (error) {
				console.error("Error fetching datasets:", error);
			}
		};
		fetchData().then(r => {
			console.log("got existingRoomsDatasets list!");
		});
	}, []);

	const handleRoomsQuerySearchClick = async () => {
		const serverUrl = "http://localhost:4321";
		const endpointUrl = "/query";
		const url = serverUrl + endpointUrl;
		const furnitureKey = datasetID + "_furniture";
		const seatsKey = datasetID + "_seats";

		// Validate room size
		const parsedRoomSize = parseInt(roomSize, 10);
		if (isNaN(parsedRoomSize)) {
			alert(`"${roomSize}" is not an integer. Please enter a valid integer for room size.`);
			return;
		}

		try {
			const query = {
				"WHERE": {
					"AND": [
						{
							"GT": {
								[seatsKey]: parseInt(roomSize)
							}
						},{
							"IS": {
								[furnitureKey]: furnitureType
							}
						}
					]
				},
				"OPTIONS": {
					"COLUMNS": columnsKey,
					"ORDER": seatsKey
				}
			};
			console.log(query);
			const res = await axios.post(url, query);
			console.log(res);
			setQueryResults(res.data.result);
			setShowResults(true);
		} catch (error) {
			alert(`ERROR QUERYING: ${error}`);
		}
	};

	return (
		<div className="coordinator">
			<h1>Coordinator</h1>
			<h2>Find Suitable Rooms</h2>

			Target Rooms Dataset: <select id="existingRoomsDatasets" value={datasetID}
										  onChange={(e) => setDatasetID(e.target.value)}>
				{!datasetID && <option disabled value="">Select a rooms dataset</option>}
				{existingRoomsDatasets.map((id) => (
					<option key={id} value={id}>{id}</option>
				))}
			</select>
			<br />

			Room Furniture Type: <select id="roomsFurniture" value={furnitureType}
										 onChange={(e)=> setFurnitureType(e.target.value)}>
				<option disabled={!furnitureType} value="">Select a type of furniture</option>
				<option>Classroom-Fixed Tables/Fixed Chairs</option>
				<option>Classroom-Fixed Tables/Movable Chairs</option>
				<option>Classroom-Fixed Tables/Moveable Chairs</option>
				<option>Classroom-Fixed Tablets</option>
				<option>Classroom-Hybrid Furniture</option>
				<option>Classroom-Learn Lab</option>
				<option>Classroom-Movable Tables & Chairs</option>
				<option>Classroom-Movable Tablets</option>
				<option>Classroom-Moveable Tables & Chairs</option>
				<option>Classroom-Moveable Tablets</option>
			</select><br />

			Minimum Room Size: <input type="text" id="roomSize" value={roomSize} placeholder={"e.g. 50"}
									  onChange={(e) => setRoomSize(e.target.value)}/><br />
			<button onClick={handleRoomsQuerySearchClick}>Search Rooms</button>

			{showResults && <div>
			{/*Display search results in a table*/}
			<h3>Query Results</h3>
			<table>
				<thead>
				<tr>
					{columnsKey.map((column) => (
						<th key={column}>{column.substring(column.indexOf("_")+1)}</th>
					))}
				</tr>
				</thead>
				<tbody>
					{queryResults.map((result, index) => (
						<tr key={index}>
							{columnsKey.map((column) => (
								<td key={column}>{result[column]}</td>
							))}
						</tr>
					))}
				</tbody>
			</table>
			</div>
			}
		</div>
	)
}

export default Coordinator;
