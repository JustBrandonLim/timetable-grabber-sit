using OpenQA.Selenium;
using OpenQA.Selenium.Chrome;
using OpenQA.Selenium.Support.UI;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;

namespace TimetableGrabber___SIT.API
{
    internal class IN4SIT
    {
        //1 semester is 13 weeks

        private const string LOGIN_URL = "https://fs.singaporetech.edu.sg/adfs/ls/idpinitiatedsignon.asmx?loginToRp=https://in4sit.singaporetech.edu.sg/psp/CSSISSTD/";

        IWebDriver webDriverInstance = null;

        public IN4SIT()
        {
           
        }

        public async Task<bool> CreateChromeInstance()
        {
            try
            {
                ChromeDriverService chromeDriverService = ChromeDriverService.CreateDefaultService();
                chromeDriverService.HideCommandPromptWindow = true;

                ChromeOptions chromeOptions = new ChromeOptions();
                //chromeOptions.AddArgument("headless");

                webDriverInstance = new ChromeDriver(chromeDriverService, chromeOptions);

                return true;
            }
            catch (Exception ex)
            {
                return false;
            }
        }

        public async Task<bool> CloseChromeInstance()
        {
            webDriverInstance.Close();
            return true;
        }

        public async Task<bool> Login(string email, string password)
        {
            webDriverInstance.Navigate().GoToUrl(LOGIN_URL);

            IWebElement usernameTextBox = webDriverInstance.FindElement(By.CssSelector("#userNameInput"));
            usernameTextBox.SendKeys(email);

            IWebElement passwordTextBox = webDriverInstance.FindElement(By.CssSelector("#passwordInput"));
            passwordTextBox.SendKeys(password);

            IWebElement signInButton = webDriverInstance.FindElement(By.CssSelector("#submitButton"));
            signInButton.Click();

            return true;
        }

        public async Task<bool> AccessCourseManagement() 
        {
            await Task.Delay(5000);

            IWebElement courseManagement = new WebDriverWait(webDriverInstance, TimeSpan.FromSeconds(30))
                        .Until(webDriverInstance => webDriverInstance.FindElement(By.XPath("//div[contains(@onclick, 'https://in4sit.singaporetech.edu.sg/psc/CSSISSTD_newwin/EMPLOYEE/SA/c/NUI_FRAMEWORK.PT_AGSTARTPAGE_NUI.GBL?CONTEXTIDPARAMS=TEMPLATE_ID%3aPTPPNAVCOL&scname=ADMN_MODULE_MANAGEMENT&PTPPB_GROUPLET_ID=N_SR_MODULE_MATTERS&CRefName=ADMN_NAVCOLL_18&AJAXTRANSFER=Y')]")));
            
            courseManagement.Click();

            return true;
        }

        public async Task<bool> AccessMyWeeklySchedule()
        {
            await Task.Delay(5000);

            IWebElement myWeeklySchedule = new WebDriverWait(webDriverInstance, TimeSpan.FromSeconds(30))
                        .Until(webDriverInstance => webDriverInstance.FindElement(By.XPath("//div[contains(@href, 'https://in4sit.singaporetech.edu.sg/psc/CSSISSTD_newwin/EMPLOYEE/SA/c/SA_LEARNER_SERVICES.SSR_SSENRL_SCHD_W.GBL')]")));

            myWeeklySchedule.Click();

            return true;
        }

        public async Task<bool> GoToTrimesterStartDate(string trimesterStartDate)
        {
            await Task.Delay(5000);

            webDriverInstance.SwitchTo().Frame("main_target_win0");

            bool atStartDate = false;
            do
            {
                await Task.Delay(5000);

                IWebElement trimesterStartDateInput = new WebDriverWait(webDriverInstance, TimeSpan.FromSeconds(30))
                        .Until(webDriverInstance => webDriverInstance.FindElement(By.CssSelector("#DERIVED_CLASS_S_START_DT")));

                if (trimesterStartDateInput.GetAttribute("value") != trimesterStartDate)
                {
                    IWebElement previousWeekButton = new WebDriverWait(webDriverInstance, TimeSpan.FromSeconds(5))
                        .Until(webDriverInstance => webDriverInstance.FindElement(By.CssSelector("#DERIVED_CLASS_S_SSR_PREV_WEEK")));

                    previousWeekButton.Click();
                }
                else
                    atStartDate = true;

                await Task.Delay(1000);

            } while (!atStartDate);

            return true;
        }

        public async Task<bool> ScrapeSchedule()
        {
            await Task.Delay(5000);

            IWebElement scheduleTable = new WebDriverWait(webDriverInstance, TimeSpan.FromSeconds(30))
                       .Until(webDriverInstance => webDriverInstance.FindElement(By.CssSelector("#WEEKLY_SCHED_HTMLAREA")));

            IList<IWebElement> tableRowCollection = scheduleTable.FindElements(By.TagName("tr"));

            foreach (IWebElement tableRow in tableRowCollection)
            {
                IList<IWebElement> tableDataCollection = tableRow.FindElements(By.TagName("td"));

                foreach (IWebElement tableData in tableDataCollection)
                {
                    if (tableData.GetAttribute("style") == "color: rgb(0, 0, 0); background-color: rgb(182, 209, 146); text-align: center;")
                    {
                        IWebElement course = tableData.FindElement(By.TagName("span"));

                        System.Diagnostics.Debug.WriteLine(course.GetAttribute("innerHTML"));

                        Course newCourse = new Course("", "", "", "", "");
                    }
                }
            }

            /*
                ICT 1009 - ALL<br>Lecture<br>09:00 - 12:00<br>Online
                ICT 1009 - P1<br>Laboratory<br>09:00 - 11:00<br>NYP-L2 SR2A
                ICT 1008 - P7<br>Laboratory<br>13:30 - 15:30<br>NYP-L2 SR2A
                ICT 1008 - ALL<br>Lecture<br>15:00 - 18:00<br>Online
            */
            /*
            foreach (IWebElement tableRow in tableRowCollection)
            {
                IList<IWebElement> tableDataCollection = tableRow.FindElements(By.TagName("td"));

                foreach (IWebElement tableData in tableDataCollection)
                {
                    if (tableData.GetAttribute("style") == "color: rgb(0, 0, 0); background-color: rgb(182, 209, 146); text-align: center;")
                    {
                        IWebElement course = tableData.FindElement(By.TagName("span"));
                        
                        System.Diagnostics.Debug.WriteLine(course.GetAttribute("innerHTML"));
                    }
                }
            }
            */
            return false;
        }
    }
}
