/**
 * @jest-environment jsdom
 */
import { screen, waitFor, fireEvent, createEvent } from "@testing-library/dom";
import userEvent from '@testing-library/user-event'
import NewBillUI from "../views/NewBillUI.js";
import NewBill from "../containers/NewBill.js";
import {  ROUTES_PATH } from "../constants/routes.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import mockStore from "../__mocks__/store";
import router from "../app/Router.js";

jest.mock("../app/Store", () => mockStore)

describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    test("Then mail icon  in vertical layout should be highlighted ", async () => {
      initNewBillPage(false);
      await waitFor(() => screen.getByTestId('icon-mail'));
      const mailIcon = screen.getByTestId('icon-mail');
      console.log('windowIcon', mailIcon.classList);
      //to-do write expect expression
      expect([...mailIcon.classList]).toContain('active-icon');
    })
  })

  describe("When I try to interact with the form", () => {
    beforeEach(() => { 
      //setup the pages and containers 
      initNewBillPage(true);
    })
    test("Then the form should be functional", async () => {
      const newBillContainer = new NewBill({
        document,
        onNavigate, 
        store: mockStore, 
        localStorage: window.localStorage
      });
      const newBill = { 
        amount: 348,
        commentary: "",
        date: "2024-04-26",
        email: "employee@test.tld",
        fileName: "newBillTest",
        name: "Vol Paris Londres",  
        pct: 20,
        status: 'pending',
        type: "Transports",
        vat: "70",
      }
      // Test the presence of the form
      const form = screen.getByTestId("form-new-bill");
      expect(form).toBeTruthy();

      //Test that the user can interact with the fields in the form
      userEvent.type(screen.getByTestId("expense-name"), newBill.name)
      expect(screen.getByTestId("expense-name").value).toContain(newBill.name)
      //finish testing all fields

      //test handleChangeFile function with mock
      const handleChangeFile = jest.fn(newBillContainer.handleChangeFile);
      const fileInput = screen.getByTestId("file");
      fileInput.addEventListener("change", handleChangeFile);
      fireEvent.change(fileInput);
      expect(handleChangeFile).toHaveBeenCalled();

      //Test handleSubmit function with mock 
      const handleSubmit = jest.fn(newBillContainer.handleSubmit);
      form.addEventListener("submit", handleSubmit);
      fireEvent.submit(form);
      expect(handleSubmit).toHaveBeenCalled();
    });
    test("Then I can correctly set the file in the form", () => {
      const newBillContainer = new NewBill({
        document,
        onNavigate, 
        store: mockStore, 
        localStorage: window.localStorage
      });
      const newBill = { 
        amount: 348,
        commentary: "",
        date: "2024-04-26",
        email: "employee@test.tld",
        fileName: "newBillTest",
        name: "Vol Paris Londres",  
        pct: 20,
        status: 'pending',
        type: "Transports",
        vat: "70",
      }
      const form = screen.getByTestId("form-new-bill");
      const fileInput = screen.getByTestId("file");
      const handleChangeFile = jest.fn(newBill.handleChangeFile);
      form.addEventListener("change", handleChangeFile);
      //test that we can succesfully set an image to the file input
      fireEvent.change(screen.getByTestId("file"), {
        target: {
          files: [new File(['(⌐□_□)'], `${newBill.fileName}.png`, {type: 'image/png'})],
        },
      })
      expect(fileInput.files[0].name).toContain("newBillTest.png")
    })

    //API data + response 
  });
})


const initNewBillPage = (falseEmail = false) =>  {
  Object.defineProperty(window, "localStorage", { 
    value: localStorageMock 
  });const user = {
    type: 'Employee'
  }
  if (falseEmail) { 
    user.email = 'a@a' 
  }
  window.localStorage.setItem("user", JSON.stringify(user));
  const root = document.createElement("div");
  root.setAttribute("id", "root");
  document.body.append(root);
  router();
  window.onNavigate(ROUTES_PATH.NewBill);
}