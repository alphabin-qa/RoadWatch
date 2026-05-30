import { describe, it, expect } from "vitest";
import {
  parseOsrm,
  parseNominatim,
  buildDisplayLine,
  classifyHighway,
  isValidIndianPincode,
  type ResolvedLocation,
} from "./locationLookup";

describe("parseOsrm", () => {
  it("returns null on empty / error responses", () => {
    expect(parseOsrm(null)).toBeNull();
    expect(parseOsrm({})).toBeNull();
    expect(parseOsrm({ code: "Error" })).toBeNull();
    expect(parseOsrm({ code: "Ok", waypoints: [] })).toBeNull();
  });

  it("extracts name + distance + snapped coord from a normal Anna Salai response", () => {
    const r = parseOsrm({
      code: "Ok",
      waypoints: [
        { name: "Anna Salai", distance: 4.23, location: [80.2418, 13.0413] },
      ],
    });
    expect(r).toEqual({
      roadName: "Anna Salai",
      distanceM: 4.23,
      snapped: { lat: 13.0413, lng: 80.2418 },
    });
  });

  it("treats empty name as no name (off-road / unnamed lane)", () => {
    const r = parseOsrm({
      code: "Ok",
      waypoints: [{ name: "", distance: 12.5, location: [80.0, 13.0] }],
    });
    expect(r).toEqual({
      roadName: null,
      distanceM: 12.5,
      snapped: { lat: 13.0, lng: 80.0 },
    });
  });

  it("rejects waypoints with malformed location", () => {
    expect(
      parseOsrm({
        code: "Ok",
        waypoints: [{ name: "A", distance: 1, location: [80] }],
      }),
    ).toBeNull();
  });
});

describe("parseNominatim", () => {
  it("returns null on empty / error", () => {
    expect(parseNominatim(null)).toBeNull();
    expect(parseNominatim({})).toBeNull();
    expect(parseNominatim({ error: "Unable to geocode" })).toBeNull();
  });

  it("parses a Chennai (Anna Salai) reverse response", () => {
    const r = parseNominatim({
      address: {
        road: "Anna Salai",
        suburb: "Triplicane",
        city: "Chennai",
        state: "Tamil Nadu",
        country: "India",
        country_code: "in",
        postcode: "600002",
      },
      display_name: "Anna Salai, Triplicane, Chennai, Tamil Nadu, 600002, India",
    });
    expect(r).toEqual({
      road: "Anna Salai",
      neighbourhood: "Triplicane",
      city: "Chennai",
      state: "Tamil Nadu",
      country: "India",
      pincode: "600002",
    });
  });

  it("falls back to suburb when no road tag", () => {
    const r = parseNominatim({
      address: {
        suburb: "Indiranagar",
        city: "Bengaluru",
        state: "Karnataka",
        country: "India",
      },
    });
    expect(r?.road).toBeNull();
    expect(r?.neighbourhood).toBe("Indiranagar");
    expect(r?.city).toBe("Bengaluru");
  });

  it("uses town/village when city missing (rural India)", () => {
    const r = parseNominatim({
      address: {
        village: "Devanahalli",
        county: "Bangalore Rural",
        state: "Karnataka",
        country: "India",
      },
    });
    expect(r?.city).toBe("Devanahalli");
  });

  it("uses hamlet/county as fallback for very rural records", () => {
    const r = parseNominatim({
      address: {
        hamlet: "Kollegal",
        county: "Chamarajanagar",
        state: "Karnataka",
        country: "India",
      },
    });
    expect(r?.city).toBe("Kollegal");
  });

  it("Hindi address tag preserves Devanagari", () => {
    const r = parseNominatim({
      address: {
        road: "अन्ना सलाई",
        city: "चेन्नई",
        state: "तमिल नाडु",
        country: "भारत",
      },
    });
    expect(r?.road).toMatch(/[\u0900-\u097F]/); // Devanagari
    expect(r?.city).toMatch(/[\u0900-\u097F]/);
  });
});

describe("classifyHighway", () => {
  it("maps OSM highway tags to classes", () => {
    expect(classifyHighway("trunk")).toBe("NH");
    expect(classifyHighway("primary")).toBe("SH");
    expect(classifyHighway("secondary")).toBe("MDR");
    expect(classifyHighway("tertiary")).toBe("ODR");
    expect(classifyHighway("residential")).toBe("VR");
    expect(classifyHighway("service")).toBe("SVC");
    expect(classifyHighway(undefined)).toBe(null);
    expect(classifyHighway("foobar")).toBe(null);
  });
});

describe("buildDisplayLine", () => {
  const base: ResolvedLocation = {
    snapped: { lat: 13.0413, lng: 80.2418 },
    roadName: "Anna Salai",
    distanceM: 4.2,
    address: {
      road: "Anna Salai",
      neighbourhood: "Triplicane",
      city: "Chennai",
      state: "Tamil Nadu",
      country: "India",
      pincode: "600002",
    },
  };

  it("composes a clean one-liner", () => {
    expect(buildDisplayLine(base)).toBe("Anna Salai, Triplicane, Chennai");
  });

  it("falls back gracefully when road missing", () => {
    expect(
      buildDisplayLine({
        ...base,
        roadName: null,
        address: { ...base.address!, road: null },
      }),
    ).toBe("Triplicane, Chennai");
  });

  it("falls back to coordinates when nothing resolves", () => {
    expect(
      buildDisplayLine({
        snapped: { lat: 13.04, lng: 80.24 },
        roadName: null,
        distanceM: null,
        address: null,
      }),
    ).toMatch(/13\.04, 80\.24/);
  });

  it("never duplicates when osrm road equals nominatim road", () => {
    const out = buildDisplayLine(base);
    expect(out.match(/Anna Salai/g)?.length).toBe(1);
  });
});

describe("isValidIndianPincode", () => {
  it("accepts valid pincodes from each region", () => {
    expect(isValidIndianPincode("110001")).toBe(true); // Delhi
    expect(isValidIndianPincode("395003")).toBe(true); // Surat
    expect(isValidIndianPincode("380006")).toBe(true); // Ahmedabad
    expect(isValidIndianPincode("400050")).toBe(true); // Mumbai
    expect(isValidIndianPincode("600002")).toBe(true); // Chennai
    expect(isValidIndianPincode("700001")).toBe(true); // Kolkata
    expect(isValidIndianPincode("560001")).toBe(true); // Bangalore
    expect(isValidIndianPincode("793001")).toBe(true); // Shillong
  });

  it("rejects empty / null / undefined", () => {
    expect(isValidIndianPincode(null)).toBe(false);
    expect(isValidIndianPincode(undefined)).toBe(false);
    expect(isValidIndianPincode("")).toBe(false);
  });

  it("rejects malformed pincodes", () => {
    expect(isValidIndianPincode("12345")).toBe(false);    // 5 digits
    expect(isValidIndianPincode("1234567")).toBe(false);  // 7 digits
    expect(isValidIndianPincode("000034")).toBe(false);   // starts with 0
    expect(isValidIndianPincode("ABC123")).toBe(false);   // letters
    expect(isValidIndianPincode("12 345")).toBe(false);   // spaces
  });
});

describe("parseNominatim — pan-India coverage", () => {
  it("Surat (Gujarat) — taluka-as-city fallback", () => {
    const r = parseNominatim({
      address: {
        suburb: "Udhana",
        county: "Udhna Taluka",
        state: "Gujarat",
        country: "India",
        postcode: "395010",
      },
    });
    expect(r?.neighbourhood).toBe("Udhana");
    expect(r?.city).toBe("Udhna Taluka");
    expect(r?.state).toBe("Gujarat");
    expect(r?.pincode).toBe("395010");
  });

  it("Surat — drops bogus pincode (e.g. starts with 0)", () => {
    const r = parseNominatim({
      address: { city: "Surat", state: "Gujarat", postcode: "095010" },
    });
    expect(r?.pincode).toBeNull();
  });

  it("Ahmedabad", () => {
    const r = parseNominatim({
      address: {
        road: "Ashram Road",
        suburb: "Ambawadi",
        city: "Navrangpura",
        state: "Gujarat",
        postcode: "380006",
      },
    });
    expect(r?.road).toBe("Ashram Road");
    expect(r?.state).toBe("Gujarat");
  });

  it("Mumbai (Bandra)", () => {
    const r = parseNominatim({
      address: {
        road: "Dr. BR Ambedkar Road",
        suburb: "Adarsh Nagar",
        city: "Mumbai",
        state: "Maharashtra",
      },
    });
    expect(r?.city).toBe("Mumbai");
    expect(r?.state).toBe("Maharashtra");
  });

  it("Kolkata (Esplanade)", () => {
    const r = parseNominatim({
      address: {
        road: "Chowringhee Road",
        suburb: "Esplanade",
        city: "Kolkata",
        state: "West Bengal",
      },
    });
    expect(r?.road).toBe("Chowringhee Road");
    expect(r?.state).toBe("West Bengal");
  });

  it("Hyderabad (Telangana)", () => {
    const r = parseNominatim({
      address: { road: "Tank Bund Road", city: "Hyderabad", state: "Telangana" },
    });
    expect(r?.state).toBe("Telangana");
  });

  it("Kochi (Kerala) — Malayalam codepoints survive parsing", () => {
    const r = parseNominatim({
      address: { road: "എം.ജി. റോഡ്", city: "കൊച്ചി", state: "Kerala" },
    });
    expect(r?.road).toMatch(/[\u0D00-\u0D7F]/);
    expect(r?.city).toMatch(/[\u0D00-\u0D7F]/);
    expect(r?.state).toBe("Kerala");
  });

  it("Tribal Dang district (rural Gujarat) — town fallback", () => {
    const r = parseNominatim({
      address: {
        town: "Ahwa",
        county: "The Dangs",
        state: "Gujarat",
        postcode: "394710",
      },
    });
    expect(r?.city).toBe("Ahwa");
  });

  it("North-East — Imphal (Manipur)", () => {
    const r = parseNominatim({
      address: {
        suburb: "Thangmeiband",
        city: "Imphal",
        state: "Manipur",
        postcode: "795001",
      },
    });
    expect(r?.state).toBe("Manipur");
    expect(r?.pincode).toBe("795001");
  });
});
