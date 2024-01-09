import http from "http";

export interface GeoResponse {
	lat?: number;
	lon?: number;
	error?: string;
}

export interface SavedRoom {
	fullname: string;
	shortname: string;
	number: string;
	name: string;
	address: string;
	lat: number;
	lon: number;
	seats: number;
	type: string;
	furniture: string;
	href: string;
}

export default class Room {
	private fullname: string = "";
	private shortname: string = "";
	private readonly number: string = "";
	private readonly name: string = "";
	private address: string = "";
	private lat: number = -99999;
	private lon: number = -99999;
	private readonly seats: number = -99999;
	private readonly type: string = "";
	private readonly furniture: string = "";
	private readonly href: string = "";

	constructor(savedRoom: SavedRoom | null,
		number: string, name: string, seats: number, type: string, furniture: string, href: string) {
		if (savedRoom) {
			this.fullname = savedRoom.fullname;
			this.shortname = savedRoom.shortname;
			this.address = savedRoom.address;
			this.href = savedRoom.href;
			this.number = savedRoom.number;
			this.name = savedRoom.name;
			this.seats = savedRoom.seats;
			this.type = savedRoom.type;
			this.furniture = savedRoom.furniture;
			this.lat = savedRoom.lat;
			this.lon = savedRoom.lon;
		} else {
			this.href = href;
			this.number = number;
			this.name = name.replace("-", "_");
			this.seats = seats;
			this.type = type;
			this.furniture = furniture;
			this.lat = -9999;
			this.lon = -9999;
		}
	}

	public setBuildingInformation(fullname: string, shortname: string, address: string) {
		this.fullname = fullname;
		this.shortname = shortname;
		this.address = address;
	}

	public getFullname(): string {
		return this.fullname;
	}

	public getShortname(): string {
		return this.shortname;
	}

	public getNumber(): string {
		return this.number;
	}

	public getName(): string {
		return this.name;
	}

	public getAddress(): string {
		return this.address;
	}

	public getLat(): number {
		return this.lat;
	}

	public getLon(): number {
		return this.lon;
	}

	public getSeats(): number {
		return this.seats;
	}

	public getType(): string {
		return this.type;
	}

	public getFurniture(): string {
		return this.furniture;
	}

	public getHref(): string {
		return this.href;
	}

	public async getBuildingLonAndLat(): Promise<GeoResponse> {
		const geoData = await this.getGeoLocation(this.address);
		if (geoData && geoData.lon !== undefined && geoData.lat !== undefined ) {
			return geoData as GeoResponse;
			// console.log("lon:", this.lon);
			// console.log("lat:", this.lat);
		}
		return {};
	}

	public setLatLon(geoResponse: GeoResponse) {
		const buildingLat = geoResponse.lat;
		const buildingLon = geoResponse.lon;
		if (this.lat !== undefined && this.lon !== undefined) {
			this.lat = buildingLat as number;
			this.lon = buildingLon as number;
		}
	}

	public getTdValue(node: any): string {
		return (node.childNodes[0] as any).value.trim();
	}

	public setHref(tRow: any): string {
		const columns = Array.from(tRow.childNodes);
		const hrefCol = (columns[1] as any).childNodes[1];
		return (hrefCol as any).attrs[0].value.trim();
	}

	public setRoomNum(tRow: any): string {
		const columns = Array.from(tRow.childNodes);
		const rnumCol = (columns[1] as any).childNodes[1];
		return this.getTdValue(rnumCol);
	}

	public setSeats(tRow: any): number {
		const columns = Array.from(tRow.childNodes);
		const capaCol = columns[3];
		return Number(this.getTdValue(capaCol));
	}

	public setType(tRow: any): string {
		const columns = Array.from(tRow.childNodes);
		const roomCol = columns[7];
		return this.getTdValue(roomCol);
	}

	public setFurniture(tRow: any): string {
		const columns = Array.from(tRow.childNodes);
		const furnCol = columns[5];
		return this.getTdValue(furnCol);
	}

	public async getGeoLocation(address: string): Promise<any> {
		const Url = "http://cs310.students.cs.ubc.ca:11316/api/v1/project_team186";
		const encodedAddr = encodeURIComponent(address);
		const url = `${Url}/${encodedAddr}`;

		return new Promise((resolve, reject) => {
			http.get(url, (response) => {
				let data = "";
				response.on("data", (chunk) => {
					data += chunk;
				});

				response.on("end", () => {
					try {
						const geoData = JSON.parse(data);

						if(geoData.lon && geoData.lat) {
							return resolve(geoData);
						} else if(geoData.error) {
							console.error("Error obtaining geolocation:", geoData.error);
							resolve({});
						}

					} catch(error) {
						console.error("Error obtaining geolocation:", error);
						resolve({});
					}
				});
			}).on("error", (error) => {
				console.error("Error making GET request:", error);
				resolve({});
			});
		});
	}

	public getRoomColumnField(targetField: string): string | number {
		if (targetField === "fullname") {
			return this.getFullname();
		} else if (targetField === "shortname") {
			return this.getShortname();
		} else if (targetField === "number") {
			return this.getNumber();
		} else if (targetField === "name") {
			return this.getName();
		} else if (targetField === "address") {
			return this.getAddress();
		} else if (targetField === "lat") {
			return this.getLat();
		} else if (targetField === "lon") {
			return this.getLon();
		} else if (targetField === "seats") {
			return this.getSeats();
		} else if (targetField === "type") {
			return this.getType();
		} else if (targetField === "furniture") {
			return this.getFurniture();
		} else if (targetField === "href") {
			return this.getHref();
		} else {
			throw new Error(`Invalid column: ${targetField} to get Room field`);
		}
	}
}
