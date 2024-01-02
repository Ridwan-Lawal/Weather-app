import { GoDotFill, GoSearch } from "react-icons/go";
import { FaLocationDot } from "react-icons/fa6";
import { CiSearch } from "react-icons/ci";
import { IoCloseOutline } from "react-icons/io5";
import { useEffect, useState } from "react";
import { IoMdSend, IoIosSend } from "react-icons/io";
import "animate.css";

let apiKey = "7db2b037e80a4b56ba9134126232202";

export default function App() {
  const [searchLocation, setSearchLocation] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [weatherResult, setWeatherResult] = useState({});
  const [userLocation, setUserLocation] = useState({});
  const [errorMsg, setErrorMsg] = useState("");

  // effect for getting user live location
  useEffect(function () {
    if (!navigator.geolocation) {
      setErrorMsg("Geolocation is not supported by your browser");
      return;
    }

    // Use the geolocation API to get the current position
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation(`${latitude},${longitude}`);
      },
      (error) => {
        setErrorMsg(`Error getting location: ${error.message}`);
      }
    );
  }, []);

  // effect for fetching data from api
  useEffect(
    function () {
      const abortController = new AbortController();
      const signal = abortController.signal;

      async function getWeather() {
        try {
          setIsLoading(true);
          setErrorMsg("");
          const res = await fetch(
            ` http://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${
              !searchLocation ? userLocation : searchLocation
            }&days=7`,
            { signal }
          );
          console.log(res);
          if (!res.ok) throw new Error("Something went wrong");

          const data = await res.json();
          console.log(data);
          setWeatherResult(data);
        } catch (err) {
          if (err.message !== "The user aborted a request.") {
            console.error(err.message);
            setErrorMsg(err.message);
          }
        } finally {
          setIsLoading(false);
        }
      }

      getWeather();

      return function () {
        abortController.abort();
      };
    },
    [searchLocation, userLocation]
  );

  function handleLiveLocation() {
    setSearchLocation("");
  }

  return (
    <div className="min-h-screen bg-gray-950 lg:flex font-raleway">
      <div className="lg:w-[35%] bg-header lg:bg-none lg:bg-gray-900">
        <Header
          isLoading={isLoading}
          errorMsg={errorMsg}
          weatherResult={weatherResult}
        >
          <Nav onLiveLocaton={handleLiveLocation}>
            <SearchForm
              value={searchLocation}
              onChange={(e) => setSearchLocation(e.target.value)}
            />
          </Nav>
        </Header>
      </div>
      <div className="mt-16 pb-10 px-8 lg:w-[60%]">
        <DailyForecastBlock
          isLoading={isLoading}
          weatherResult={weatherResult?.forecast?.forecastday}
        />
        <TodayHighlightsBlock
          isLoading={isLoading}
          weatherResult={weatherResult?.current}
        />
      </div>
    </div>
  );
}
//

function Loader() {
  return (
    <div className="flex justify-center items-center">
      <div className="lds-ring">
        <div></div>
        <div></div>
        <div></div>
        <div></div>
      </div>
    </div>
  );
}

function Error({ error = "There is an error" }) {
  return (
    <div className="flex justify-center items-center text-white text-3xl">
      <p>😕</p>
      <p>{error}</p>
    </div>
  );
}

// convert the shower.png to svg and create a component to the svg card so that we can customers it

function Header({
  temp = 15,
  tempType = "Shower",
  date = "Fri 5 Jun",
  location = "Helsinki",
  weatherResult,
  isLoading,
  children,
  errorMsg,
}) {
  const curWeather = weatherResult?.current;
  const [todaysDate, setTodaysDate] = useState(date);

  useEffect(function () {
    const today = new Date();
    const todayFormat = new Intl.DateTimeFormat("en-US", {
      weekday: "short",
      day: "numeric",
      month: "short",
    }).format(today);

    setTodaysDate(todayFormat);
  }, []);

  const todaysDateFormatted = todaysDate.split(" ");
  const formattedDate =
    todaysDateFormatted[0] +
    " " +
    todaysDateFormatted.slice(1).reverse().join(" ");

  return (
    <header className="  h-full ">
      <div className="h-fit bg-gray-900 bg-opacity-80 lg:bg-opacity-100 bg-no-repeat pt-0 ">
        {children}
        {errorMsg && <Error error={errorMsg} />}
        {isLoading && <Loader />}
        {!errorMsg && !isLoading && (
          <div className="pb-8 pt-5 px-6">
            {/* header content */}
            <div className="  mt-20 flex flex-col items-center">
              <img
                src={weatherResult?.current?.condition?.icon}
                alt=""
                className="w-36"
              />

              <h1 className="text-blue-50 mt-8 text-[130px] lg:text-[140px] font-medium">
                {curWeather?.temp_c}
                <span className="text-5xl text-[#6ca3f0]">&deg;C</span>{" "}
              </h1>

              <h3 className="text-4xl mt-3 lg:mt-12  text-center text-[#6ca3f0] font-bold">
                {curWeather?.condition?.text}
              </h3>
              <section className="text-lg lg:mt-8 mt-2 items-center text-[#6ca3f0] flex gap-2 justify-center">
                <p>Today</p>
                <GoDotFill fontSize="8px" />

                <p>{formattedDate}</p>
              </section>

              <p className="text-[#6ca3f0] flex justify-center items-center gap-2 text-center mt-5 text-lg">
                {" "}
                <FaLocationDot />
                {weatherResult?.location?.name},{" "}
                {weatherResult?.location?.country}
              </p>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

function Nav({ children, onLiveLocaton }) {
  const [isClicked, setIsClicked] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(function () {
    window.addEventListener("scroll", (e) => {
      console.log(window.scrollY);
      if (window.scrollY > 650) setIsScrolled(true);
      else setIsScrolled(false);
    });
  }, []);

  return (
    <div
      className={`flex justify-between px-6 pt-5  gap-5 ${
        isScrolled && "fixed bg-gray-800 shadow-lg w-[100%] py-4"
      } `}
    >
      <section className={`flex  ${isClicked ? "w-[80%]" : "w-fit"} gap-5`}>
        <div onClick={() => setIsClicked((curStatus) => !curStatus)}>
          <SearchBar isClicked={isClicked} />
        </div>
        {isClicked && children}
      </section>
      <button
        onClick={onLiveLocaton}
        className="bg-gray-700   py-1 px-3 cursor-pointer rounded-full"
      >
        <FaLocationDot className="text-gray-100 text-xl" />
      </button>
    </div>
  );
}

function SearchBar({ isClicked }) {
  return (
    <div>
      <section>
        <button className="bg-gray-700 hover:scale-105 transition-transform  py-2 px-2 cursor-pointer rounded-full">
          {isClicked ? (
            <IoCloseOutline className="text-2xl  text-white" />
          ) : (
            <CiSearch className="text-2xl text-white" />
          )}
        </button>
      </section>
    </div>
  );
}

// function IconButton({ children }) {
//   flajfs;
// }

function SearchForm({ value, onChange }) {
  function handleSubmit(e) {
    e.preventDefault();
  }
  return (
    <form
      action=""
      onSubmit={handleSubmit}
      className="w-full animate__animated animate__bounceIn  shadow-2xl rounded-md overflow-hidden bg-gray-900 flex"
    >
      <input
        type="text"
        value={value}
        onChange={onChange}
        placeholder="Search Location..."
        className="bg-inherit px-6 w-full text-white  focus:outline-none py-2 "
      />
      <button className="bg-blue-900 hover:bg-blue-600 transition-colors p-2">
        <CiSearch className="text-3xl  text-white" />
      </button>
    </form>
  );
}

function DailyForecastBlock({ weatherResult, isLoading }) {
  return (
    <div className="">
      <h3 className="text-2xl mt-14 md:text-3xl text-white font-bold">
        Daily's Forecast
      </h3>

      {isLoading ? (
        <Loader />
      ) : (
        <div className="flex flex-wrap items-center  mt-5 gap-10 lg:flex-nowrap justify-center md:justify-start lg:justify-start">
          {weatherResult?.map((forecastDay) => (
            <DailyForecastCard
              date={forecastDay?.date}
              forecastDay={forecastDay?.day}
              key={forecastDay?.date_epoch}
            >
              <img
                src={forecastDay?.day?.condition?.icon}
                className="w-14"
                alt=""
              />
            </DailyForecastCard>
          ))}
        </div>
      )}
    </div>
  );
}

function DailyForecastCard({
  day = "Tomorrow",
  children,
  deg1 = "20",
  deg2 = "12",
  forecastDay,
  date,
}) {
  const curDate = new Date().getDate();

  // converted the date gotten from the daily forcast into real date
  const foreCastDate = new Date(date);
  const foreCastDateToString = foreCastDate.toLocaleDateString(undefined, {
    weekday: "long",
  });

  return (
    <div className="text-white max-w-[300px] flex flex-col items-center gap-5 shadow-xl py-6 bg-slate-900 w-full ">
      <p className="tracking-wide">
        {curDate === foreCastDate.getDate() && "Today"}{" "}
        {foreCastDate.getDate() - curDate === 1 && "Tomorrow"}
        {Math.abs(foreCastDate.getDate() - curDate) > 1 && foreCastDateToString}
      </p>
      {children}
      <p className="flex  gap-8 justify-center">
        <span>{forecastDay.avgtemp_c}&deg;C</span>
        <span className="text-gray-400">{forecastDay.avgtemp_f}&deg;F</span>
      </p>
    </div>
  );
}

function TodayHighlightsBlock({ isLoading, weatherResult }) {
  return (
    <div>
      <h3 className="text-2xl mt-14 md:text-3xl text-white font-bold">
        Today's Highlights
      </h3>

      {isLoading ? (
        <Loader />
      ) : (
        <div className="grid mt-6 grid-cols-1 gap-8 md:grid-cols-2">
          {/* wind status */}
          <TodayHighlightsCard
            highlighthead="Wind Status"
            highlightValue={weatherResult?.wind_mph}
          >
            <div className="flex items-center gap-4">
              <button className="bg-gray-700 hover:scale-105 transition-transform  py-1 px-1 cursor-pointer rounded-full">
                <IoIosSend className="text-2xl" />
              </button>
              <p>{weatherResult?.wind_dir}</p>
            </div>
          </TodayHighlightsCard>

          {/* humidity */}
          <TodayHighlightsCard
            highlighthead="Humidity"
            highlightValue={weatherResult?.humidity}
            highlightUnit="%"
          >
            <div className="  w-full">
              <section className="flex justify-between text-slate-400 text-xs">
                <p>0%</p>
                <p>50%</p>
                <p>100%</p>
              </section>
              <input
                type="range"
                value={weatherResult?.humidity}
                id="rangeInput"
                className="rounded-lg overflow-hidden appearance-none bg-gray-400 h-2 w-full"
              />
            </div>
          </TodayHighlightsCard>

          {/* visibility */}
          <TodayHighlightsCard
            highlighthead="Visiblity"
            highlightValue={weatherResult?.vis_miles}
            highlightUnit="miles"
          />

          {/* air pressure */}
          <TodayHighlightsCard
            highlighthead="Air Pressure"
            highlightValue={weatherResult?.pressure_mb}
            highlightUnit="mb"
          />
        </div>
      )}
    </div>
  );
}

function TodayHighlightsCard({
  highlighthead = "Wind Status",
  highlightValue = "7",
  highlightUnit = "mph",
  children,
}) {
  return (
    <div className="text-blue-50 px-10 flex flex-col items-center w-full shadow-lg bg-slate-900 pb-9 pt-7  text-center space-y-5 ">
      <p className="text-lg">{highlighthead}</p>
      <p className="text-6xl text-slate-200  font-bold">
        {highlightValue}
        <span className="text-4xl ml-3 font-normal">{highlightUnit}</span>
      </p>
      {children}
    </div>
  );
}
