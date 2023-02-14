import axios from "axios";
import launches from "./launches.mongo";
import planets from "./planets.mongo";
// const launches = new Map();
const DEFAULT_FLIGHT_NUMBER = 100;
// let latestFlightNumber = 100;

// const launch = {
//   flightNumber: 100, //flight_number
//   mission: "Kepler exploration C", //name
//   rocket: "Explorer IS1", //rocker.name
//   launchDate: new Date("December 27, 2030"), //date_local
//   target: "Kepler-442 b", //NA
//   customer: ["ZTM", "NASA"], //pauload.customers for each payload
//   upcoming: true, //upcoming
//   success: true, //success
// };
// // launches.set(launch.flightNumber, launch);
// saveLaunch(launch);

const SPACEX_API_URL = "https://api.spacexdata.com/v4/launches/query";

async function populateLaunchesDatabase() {
  const response = await axios.post(SPACEX_API_URL, {
    query: {},
    options: {
      pagination: false,
      populate: [
        {
          path: "rocket",
          select: {
            name: 1,
          },
        },
        {
          path: "payloads",
          select: {
            customers: 1,
          },
        },
      ],
    },
  });
  if (response.status != 200) {
    console.error("Problem edownloading launch data");
    throw Error("Unable to download launch data");
  }
  const launchDocs = response.data.docs;
  for (const launchDoc of launchDocs) {
    const payloads = launchDoc["payloads"];
    const customers = payloads.flatMap((payload) => {
      return payload["customers"];
    });
    const launch = {
      flightNumber: launchDoc["flight_number"], //flight_number
      mission: launchDoc["name"], //name
      rocket: launchDoc["rocket"]["name"], //rocker.name
      launchDate: launchDoc["date_local"], //date_local
      customer: customers, //pauload.customers for each payload
      upcoming: launchDoc["upcoming"], //upcoming
      success: launchDoc["success"], //success
    };
    console.log(`${launch.flightNumber} ${launch.mission}`);
    await saveLaunch(launch);
  }
}

async function loadLaunchesData() {
  console.info("Loading launches data");
  const launch = await findLaunch({
    flightNumber: 1,
    mission: "FalconSat",
  });
  if (launch) {
    console.log("Launch data already exists");
  } else {
    await populateLaunchesDatabase();
  }
}

async function getLatestFlightNumber() {
  const latestLaunch = await launches.findOne({}).sort("-flightNumber");
  if (!latestLaunch) {
    return DEFAULT_FLIGHT_NUMBER;
  }
  return latestLaunch.flightNumber;
}

async function getAllLaunches(skip, limit) {
  return await launches
    .find(
      {},
      {
        _id: 0,
        __v: 0,
      }
    )
    .skip(skip)
    .limit(limit)
    .sort({
      flightNumber: 1,
    });
}

async function saveLaunch(launch) {
  await launches.findOneAndUpdate(
    {
      flightNumber: launch.flightNumber,
    },
    launch,
    {
      upsert: true,
    }
  );
}

async function scheduleNewLaunch(launch) {
  const planet = await planets.findOne({
    keplerName: launch.target,
  });
  if (!planet) {
    throw new Error("No matching planet was found");
  }
  const newFlightNumber = (await getLatestFlightNumber()) + 1;
  const newLaunch = Object.assign(launch, {
    flightNumber: newFlightNumber,
    upcoming: true,
    success: true,
    customers: ["ZTM", "NASA"],
  });
  await saveLaunch(newLaunch);
}

// function addNewLaunch(launch) {
// latestFlightNumber++;
// launches.set(
//   latestFlightNumber,
//   Object.assign(launch, {
//     flightNumber: latestFlightNumber,
//     upcoming: true,
//     success: true,
//     customers: ["ZTM", "NASA"],
//   })
// );
// }

async function findLaunch(filter) {
  return await launches.findOne(filter);
}

async function existsLaunchWithId(launchId) {
  return await findLaunch({
    flightNumber: launchId,
  });
}

async function abortLaunch(id) {
  // launches.get(id).upcoming = false;
  // launches.get(id).success = false;
  // console.log(doesExist);
  // return doesExist;
  const aborted = await launches.updateOne(
    {
      flightNumber: id,
    },
    {
      upcoming: false,
      success: false,
    }
  );
  return aborted.modifiedCount === 1;
}

export {
  getAllLaunches,
  scheduleNewLaunch,
  abortLaunch,
  existsLaunchWithId,
  loadLaunchesData,
};
