import { FetchWrapper } from "./fetch-wrapper";
import simple_number_formatter from "@skalwar/simple_number_formatter";
import snackbar from "snackbar";
import "snackbar/dist/snackbar.min.css";
import Chart from "chart.js/auto";

const API = new FetchWrapper(
  "https://firestore.googleapis.com/v1/projects/programmingjs-90a13/databases/(default)/documents/"
);

const ENDPOINT = "eyoel";
let myChart = {};

const getPostData = ({ fat, protein, carbs, foodname }) => {
  return {
    fields: {
      fat: {
        integerValue: fat,
      },
      protein: {
        integerValue: protein,
      },
      carbs: {
        integerValue: carbs,
      },
      foodname: {
        stringValue: foodname,
      },
    },
  };
};

const handleAdd = async (event) => {
  event.preventDefault();

  let fat = Number(document.querySelector("#fat-input").value);
  let protein = Number(document.querySelector("#protein-input").value);
  let carbs = Number(document.querySelector("#carb-input").value);
  let foodname = document.querySelector("#foods").value;
  let foodChoosen = document.querySelector(".food-choosen");

  const postData = getPostData({ fat, protein, carbs, foodname });

  //posting data to the firebase API
  API.post(ENDPOINT, postData).then((newItem) => {
    snackbar.show("Food added successfully");
    drawChart(carbs, protein, fat);
    addToCalorieBox(newItem);
  });

  //formField.value = "";
};

const addButton = document.querySelector("#add-button");
addButton.addEventListener("click", handleAdd);

const drawChart = (carbs, protein, fat) => {
  const ctx = document.getElementById("myChart");
  if (myChart.destroy) {
    myChart.destroy();
  }

  myChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: ["Carbs", "Protien", "fat"],
      datasets: [
        {
          label: "# of Votes",
          data: [carbs, protein, fat],
          backgroundColor: [
            "rgba(255, 99, 132, 0.2)",
            "rgba(54, 162, 235, 0.2)",
            "rgba(255, 206, 86, 0.2)",
          ],
          borderColor: [
            "rgba(255, 99, 132, 1)",
            "rgba(54, 162, 235, 1)",
            "rgba(255, 206, 86, 1)",
          ],
          borderWidth: 1,
        },
      ],
    },
    options: {
      scales: {
        y: {
          beginAtZero: true,
        },
      },
    },
  });
};

function delCard(e) {
  console.log("delete card clicked");
  e.target.parentElement.remove();
}

// attach delete event to the buttons added dynamically
const attachDeleteEvent = () => {
  const delBtns = document.querySelectorAll(".delBtn");
  delBtns.forEach((delBtn) => {
    delBtn.addEventListener("click", delCard);
  });
};

const totalCalories = (carbs, protein, fat) =>
  carbs * 4 + protein * 4 + fat * 9;

const addToCalorieBox = (item) => {
  const carb = item.fields.carbs.integerValue;
  const protein = item.fields.protein.integerValue;
  const fat = item.fields.fat.integerValue;
  const total = totalCalories(carb, protein, fat);
  const card = `<div class="total-food-calories">
    <h2 class="food-choosen">${item.fields.foodname.stringValue}</h2>
    <p>Total calories: <span>${total}</span></p>
    <span>Carbs:<span class="carbs">${carb}</span>g</span>
    <span>protein:<span class="protein">${protein}</span>g</span>
    <span>Fat:<span class="fat">${fat}</span>g</span>
		<button class="delBtn">Delete</button>
  </div>`;

  document
    .querySelector("#card-containers")
    .insertAdjacentHTML("beforeend", card);

  let grandTotal = document.querySelector("#gross-calories-result").textContent;
  grandTotal = Number(grandTotal.replace(",", "")) + total;
  const result = simple_number_formatter(grandTotal);

  document.querySelector("#gross-calories-result").innerHTML = result;
};

const init = async () => {
  API.get(ENDPOINT).then((response) => {
    response.documents.map((item) => addToCalorieBox(item));
    attachDeleteEvent();
  });
};

init();
