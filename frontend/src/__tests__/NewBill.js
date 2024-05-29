/**
 * @jest-environment jsdom
 */
import { screen, waitFor, fireEvent, createEvent } from "@testing-library/dom";
import userEvent from '@testing-library/user-event'
import NewBillUI from "../views/NewBillUI.js";
import NewBill from "../containers/NewBill.js";
import {  ROUTES_PATH, ROUTES } from "../constants/routes.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import Bills from "../containers/Bills.js";
import BillsUI from "../views/BillsUI.js";
import mockStore from "../__mocks__/store";
import router from "../app/Router.js";

jest.mock("../app/Store", () => mockStore)


const onNavigate = (pathname) => {
  document.body.innerHTML = ROUTES({ pathname })
};

beforeEach(() => {
  Object.defineProperty(window, "localStorage", { 
    value: localStorageMock 
  });
  const user = {
    type: 'Employee',
    email: 'a@a'
  };
  window.localStorage.setItem("user", JSON.stringify(user));
  const root = document.createElement("div");
  root.setAttribute("id", "root");
  document.body.append(root);
  router();
});

afterEach(() => {
  jest.clearAllMocks();
  console.log = global.console.log;
});



describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    test("Then mail icon  in vertical layout should be highlighted ", async () => {
      window.onNavigate(ROUTES_PATH.NewBill);
      await waitFor(() => screen.getByTestId('icon-mail'));
      const mailIcon = screen.getByTestId('icon-mail');
      console.log('windowIcon', mailIcon.classList);
      //to-do write expect expression
      expect([...mailIcon.classList]).toContain('active-icon');
    })
  })

  describe("When I try to interact with the form", () => {
    test("Then the form should be functional", async () => {
      const newBillContainer =new NewBill({
        document,
        onNavigate,
        store: mockStore,
        localStorage: window.localStorage,
      });
      const newBill = { 
        id: "47qAXb6fIm2zOKkLzMro",
        vat: "80",
        fileUrl: "https://firebasestorage.googleapis.com/v0/b/billable-677b6.a…f-1.jpg?alt=media&token=c1640e12-a24b-4b11-ae52-529112e9602a",
        status: "pending",
        type: "Hôtel et logement",
        commentary: "séminaire billed",
        name: "encore",
        fileName: "preview-facture-free-201801-pdf-1.jpg",
        date: "2004-04-04",
        amount: 400,
        commentAdmin: "ok",
        email: "a@a",
        pct: 20
      }
      window.onNavigate(ROUTES_PATH.NewBill);
      // Test the presence of the form
      const form = screen.getByTestId("form-new-bill");
      expect(form).toBeTruthy();

      //Test that the user can interact with the fields in the form
      const expenseTypeInput = screen.getByTestId("expense-type");
      userEvent.selectOptions(expenseTypeInput, newBill.type);
      expect(expenseTypeInput.value).toBe(newBill.type);

      const expenseNameInput = screen.getByTestId("expense-name");
      userEvent.type(expenseNameInput, newBill.name);
      expect(expenseNameInput.value).toBe(newBill.name);

      const datePickerInput = screen.getByTestId("datepicker");
      fireEvent.change(datePickerInput, { target: { value: newBill.date } });
      expect(datePickerInput.value).toBe(newBill.date);

      const amountInput = screen.getByTestId("amount");
      userEvent.type(amountInput, newBill.amount.toString());
      expect(amountInput.value).toBe(newBill.amount.toString());

      const vatInput = screen.getByTestId("vat");
      userEvent.type(vatInput, newBill.vat);
      expect(vatInput.value).toBe(newBill.vat);

      const pctInput = screen.getByTestId("pct");
      userEvent.type(pctInput, newBill.pct.toString());
      expect(pctInput.value).toBe(newBill.pct.toString());

      const commentaryInput = screen.getByTestId("commentary");
      userEvent.type(commentaryInput, newBill.commentary);
      expect(commentaryInput.value).toBe(newBill.commentary);


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
      const newBill = { 
        id: "47qAXb6fIm2zOKkLzMro",
        vat: "80",
        fileUrl: "https://firebasestorage.googleapis.com/v0/b/billable-677b6.a…f-1.jpg?alt=media&token=c1640e12-a24b-4b11-ae52-529112e9602a",
        status: "pending",
        type: "Hôtel et logement",
        commentary: "séminaire billed",
        name: "encore",
        fileName: "newBillTest",
        date: "2004-04-04",
        amount: 400,
        commentAdmin: "ok",
        email: "a@a",
        pct: 20
      }
      const newBillContainer =new NewBill({
        document,
        onNavigate,
        store: mockStore,
        localStorage: window.localStorage,
      });
      window.onNavigate(ROUTES_PATH.NewBill);
      const fileInput = screen.getByTestId("file");
      const handleChangeFile = jest.fn(newBillContainer.handleChangeFile);
      fileInput.addEventListener("change", handleChangeFile);
      //test that we can succesfully set an image to the file input
      fireEvent.change(screen.getByTestId("file"), {
        target: {
          files: [new File(['(⌐□_□)'], `${newBill.fileName}.png`, {type: 'image/png'})],
        },
      })
      expect(fileInput.files[0].name).toContain("newBillTest.png");
    })

    //POST API TEST
    describe("When the user sends the form", () => { 
      test("Sends a new Bill to the MOCK POST API", async () => { 
        const newBill = { 
          id: "47qAXb6fIm2zOKkLzMro",
      vat: "80",
      fileUrl: "https://firebasestorage.googleapis.com/v0/b/billable-677b6.a…f-1.jpg?alt=media&token=c1640e12-a24b-4b11-ae52-529112e9602a",
      status: "pending",
      type: "Hôtel et logement",
      commentary: "séminaire billed",
      name: "encore",
      fileName: "preview-facture-free-201801-pdf-1.jpg",
      date: "2004-04-04",
      amount: 400,
      commentAdmin: "ok",
      email: "a@a",
      pct: 20
        }
        const sendBill = await mockStore.bills().update(newBill);
        expect(sendBill).toEqual(newBill); 
      })
      describe("When an error occurs on API", () => {
        test("Add new bill that doesnt pass and get back error 404", async () => {
        const spyStore = jest.spyOn(mockStore, "bills")
        const mockedStoreFn = spyStore.mockImplementationOnce(() => {
            return {
              create: jest.fn(() => { 
                throw new Error("Erreur 404");
              }),
            };
          });

          await expect(() => mockedStoreFn().create()).toThrowError("Erreur 404"); 
        });
      });
    })
  });
})