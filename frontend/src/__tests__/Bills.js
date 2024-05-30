/**
 * @jest-environment jsdom
 */

import { screen, waitFor } from "@testing-library/dom";
import userEvent from '@testing-library/user-event'
import BillsUI from "../views/BillsUI.js";
import { bills } from "../fixtures/bills.js";
import { ROUTES_PATH, ROUTES } from "../constants/routes.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import Bills from "../containers/Bills.js";
import mockStore from "../__mocks__/store"
import router from "../app/Router.js";

jest.mock("../app/Store", () => mockStore);

describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", async () => {
      initBillPage(false,true);
      await waitFor(() => screen.getByTestId('icon-window'));
      const windowIcon = screen.getByTestId('icon-window');
      console.log('windowIcon', windowIcon.classList);
      //to-do write expect expression
      expect([...windowIcon.classList]).toContain('active-icon');
    });

    test("Then bills should be ordered from earliest to latest", () => {
      document.body.innerHTML = BillsUI({ data: bills });
      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML);

      const antiChrono = (a, b) => ((a < b) ? 1 : -1);
      const datesSorted = [...dates].sort(antiChrono);
      expect(dates).toEqual(datesSorted);
    });
  });

  describe('When I press new bill button', () => { 
    test("Then I arrive on the new bill page", async () => { 
      initBillPage(false, true);
      await waitFor(() => screen.getByTestId('btn-new-bill'));
      const newBillButton = screen.getByTestId('btn-new-bill');
      // Clicks on the button and checks the current path 
      newBillButton.click();
      expect(window.location.href).toEqual(`${window.location.origin}/#employee/bill/new`);
    });
  });

  describe('When I press one of the eye icons', () => { 
    test("Then the modal should open", async () => {
      Object.defineProperty(window, 'localStorage', { value: localStorageMock });
      window.localStorage.setItem('user', JSON.stringify({ type: "Employee", email: "test@test.fr" }));

     
      $.fn.modal = jest.fn(); 
      document.body.innerHTML = BillsUI({ data: bills }); 

      
      const bill = new Bills({
        document,
        onNavigate: jest.fn(),
        store: null,
        localStorage: window.localStorage,
      });

      
      const handleClickIconEyeMock = jest.fn(bill.handleClickIconEye.bind(bill));
      bill.handleClickIconEye = handleClickIconEyeMock;

      
      const iconEye = screen.getAllByTestId("icon-eye")[0];
      userEvent.click(iconEye);

      
      expect(handleClickIconEyeMock).toHaveBeenCalled(); 
      expect($.fn.modal).toHaveBeenCalled();
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
    });
  describe("When I navigate to the bills page", () => { 
    test("Fetches bills from mock API GET", async () => { 
      initBillPage(true, true);
      await waitFor(() => screen.getByText("Mes notes de frais"));
      const billsTable = await screen.getByTestId("tbody");
      expect(billsTable).toBeTruthy();
    })
  })
  describe("When an error occurs on API", () =>  {
    beforeEach(() => { 
      jest.spyOn(mockStore, "bills");
      Object.defineProperty(window, "localStorage", { 
        value: localStorageMock
      });
      window.localStorage.setItem("user", JSON.stringify({ 
        type: "Employee", 
        email: "a@a" 
      }));
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.appendChild(root);
      router();

      //initBillPage(true,false);
    })
    test("fetches bills from an API and fails with 404 message error", async () => {
      mockStore.bills.mockImplementationOnce(() => {
        return { 
          list: () => { 
          return Promise.reject(new Error("Erreur 404"));
         }};
      });
      window.onNavigate(ROUTES_PATH.Bills);
      await new Promise(process.nextTick);
      const message = await screen.getByText(/Erreur 404/);
      expect(message).toBeTruthy();
    });
    test("fetches bills from an API and faills with 500 message error", async () => { 
      mockStore.bills.mockImplementationOnce(() => {
        return {
          list : () =>  {
            return Promise.reject(new Error("Erreur 500"))
          }
        }});
      window.onNavigate(ROUTES_PATH.Bills);
      await new Promise(process.nextTick);
      const message = await screen.getByText(/Erreur 500/);
      expect(message).toBeTruthy();
    })
  })
});
});


const initBillPage = (falseEmail = false, navigateToBills = false) => { 
  Object.defineProperty(window, 'localStorage', { 
    value: localStorageMock 
  });
  const user = {
    type: 'Employee'
  }
  if (falseEmail) { 
    user.email = 'a@a' 
  }
  window.localStorage.setItem('user', JSON.stringify(user));
  const root = document.createElement("div");
  root.setAttribute("id", "root");
  document.body.append(root);
  router();
  if (navigateToBills) { 
    window.onNavigate(ROUTES_PATH.Bills);
  }
}

