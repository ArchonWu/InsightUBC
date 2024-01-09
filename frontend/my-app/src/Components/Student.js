import React, { useEffect, useState } from "react";
import axios from "axios";

function Student() {
	const [existingCourses, setExistingCourses] = useState([]);
	const [datasetID, setDatasetID] = useState("");
	const [queryResults, setQueryResults] = useState([]);
	const [subjectCode, setSubjectCode] = useState("");
	const [courseNumber, setCourseNumber] = useState("");
	const [minAverage, setMinAverage] = useState("");
	const [showResults, setShowResults] = useState(false);
	const columnsKey =
		[
			`${datasetID}_dept`,
			`${datasetID}_id`,
			`${datasetID}_year`,
			`${datasetID}_instructor`,
			`${datasetID}_avg`,
			`${datasetID}_pass`,
			`${datasetID}_fail`
		];

	const avgKey = `${datasetID}_avg`;
	const deptKey = `${datasetID}_dept`;
	const codeKey = `${datasetID}_id`;

	useEffect(() => {
		const fetchDatasets = async () => {
			try {
				const res = await axios.get("http://localhost:4321/datasets");
				const courses = res.data.result.filter((dataset) => dataset.kind === "sections");
				const ids = courses.map((dataset) => dataset.id);
				setExistingCourses(ids);
			} catch (error) {
				console.error("Error fetching courses:", error);
			}
		};

		fetchDatasets().then(() => {
			console.log("Got existingCourses list!");
		});
	}, []);



	const handleSearchButton = async () => {
		const serverUrl = "http://localhost:4321";
		const endpointUrl = "/query";
		const url = serverUrl + endpointUrl;

		try {
			if(!subjectCode) {
				alert("Please enter a subject code");
				return;
			} else if(!courseNumber) {
				alert("Please enter a course number");
				return
			} else if(isNaN(parseInt(courseNumber))) {
				alert(`Error: "${courseNumber}" is not a valid integer. Please enter a valid integer for the course number.`);
				return;
			} else if(!minAverage) {
				alert("Please select a minimum average");
				return;
			} else {
				const query = {
					"WHERE": {
						"AND": [
							{
								"GT": {
									[avgKey]: parseInt(minAverage)
								}
							},
							{
								"IS": {
									[deptKey]: subjectCode
								}
							},
							{
								"IS": {
									[codeKey]: courseNumber
								}
							}
						]
					},
					"OPTIONS": {
						"COLUMNS": columnsKey,
						"ORDER": avgKey
					}
				};

				console.log(query);
				const res = await axios.post(url, query);
				console.log(res);
				setQueryResults(res.data.result);}
				setShowResults(true);
		} catch (error) {
			alert(`ERROR QUERYING: ${error}`);
		}
	};

	const resultColumnNames = ["Course Code", "Year", "Instructor", "Average", "# Passed", "# Failed"];

	return (
		<div className="student">
			<h1>Student</h1>
			<h2>Find Course Information</h2>

			Target Sections Dataset: <select id="existingCoursesDatasets" value={datasetID}
											 onChange={(e) => setDatasetID(e.target.value)}>
			{!datasetID && <option disabled value="">Select a sections dataset</option>}
			{existingCourses.map((id) => (
				<option key={id} value={id}>{id}</option>
			))}
		</select>
			<br />

			Subject Code: <input
			type="text"
			value={subjectCode}
			placeholder={"e.g. cpsc"}
			onChange={(e) => setSubjectCode(e.target.value)}
		/>
			<br />

			Course Number: <input
			type="text"
			value={courseNumber}
			placeholder={"e.g. 310"}
			onChange={(e) => setCourseNumber(e.target.value)}
		/>
			<br />

			Minimum Average: <select
			value={minAverage}
			onChange={(e) => setMinAverage(e.target.value)}
		>
			<option disabled={!minAverage} value="">
				Select a min average
			</option>
			<option> 10 </option>
			<option> 20 </option>
			<option> 30 </option>
			<option> 40 </option>
			<option> 50 </option>
			<option> 60 </option>
			<option> 70 </option>
			<option> 80 </option>
			<option> 90 </option>
			<option> 100 </option>
		</select>
			<br />

			<button onClick={handleSearchButton}>Search Course</button>


			{/*Only show results once Search button is clicked*/}
			{showResults && <div>
			{/*	Displaying results in table*/}
			<h3>Query Results</h3>
			<table>
				<thead>
				<tr>
					{resultColumnNames.map((column, index) => (
						<th key={index}>{column}</th>
					))}
				</tr>
				</thead>
				<tbody>
				{queryResults.map((result, rowIndex) => (
					<tr key={rowIndex}>
						<td>{`${result[deptKey]} ${result[codeKey]}`}</td>
						<td>{result[`${datasetID}_year`]}</td>
						<td>{result[`${datasetID}_instructor`]}</td>
						<td>{result[`${datasetID}_avg`]}</td>
						<td>{result[`${datasetID}_pass`]}</td>
						<td>{result[`${datasetID}_fail`]}</td>
					</tr>
				))}
				</tbody>
			</table>
		</div>
			}
		</div>
	);
}

export default Student;

