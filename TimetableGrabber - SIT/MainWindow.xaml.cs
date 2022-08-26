using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Data;
using System.Windows.Documents;
using System.Windows.Input;
using System.Windows.Media;
using System.Windows.Media.Imaging;
using System.Windows.Navigation;
using System.Windows.Shapes;
using TimetableGrabber___SIT.API;

namespace TimetableGrabber___SIT
{
    /// <summary>
    /// Interaction logic for MainWindow.xaml
    /// </summary>
    public partial class MainWindow : Window
    {
        private const string LOCAL_VERSION = "V1.3.2";
        private IN4SIT in4sit;
        private SelectionWindow selectionWindow;

        public MainWindow()
        {
            InitializeComponent();

            Title = string.Format("TimetableGrabber - SIT ({0})", LOCAL_VERSION);
        }

        private async void Window_Loaded(object sender, RoutedEventArgs e)
        {
            using (HttpClient httpClient = new HttpClient())
            {
                httpClient.DefaultRequestHeaders.Add("User-Agent", "TimetableGrabber - SIT");

                string responseString = await httpClient.GetStringAsync("https://api.github.com/repos/justbrandonlim/timetablegrabber-sit/releases");

                JArray jsonArray = (JArray)JsonConvert.DeserializeObject(responseString);
                if (jsonArray[0]["tag_name"].ToString() != LOCAL_VERSION)
                {
                    MessageBox.Show("There is a new update available!", "TimetableGrabber - SIT", MessageBoxButton.OK);
                    Process.Start(jsonArray[0]["html_url"].ToString());
                    Close();
                }
            }

            in4sit = new IN4SIT(this);
        }

        private async void ButtonStart_Click(object sender, RoutedEventArgs e)
        {
            string username = TextBoxUsername.Text;
            string password = PasswordBoxPassword.Password;

            ButtonStart.IsEnabled = false;
            TextBoxUsername.IsEnabled = false;
            PasswordBoxPassword.IsEnabled = false;

            if (String.IsNullOrWhiteSpace(username) || String.IsNullOrWhiteSpace(password))
                MessageBox.Show("Please enter your username or password!", "TimetableGrabber - SIT", MessageBoxButton.OK, MessageBoxImage.Error);
            else
            {
                if (MessageBox.Show("By running this application, you agree that you are responsible for your own account!\nPlease also ensure that your username and password is correct!\nYou can compile the program yourself if you are not comfortable.", "TimetableGrabber - SIT", MessageBoxButton.YesNo, MessageBoxImage.Warning) == MessageBoxResult.Yes)
                {
                    bool succeeded = await Task.Run(() => in4sit.Start(username, password));
                    if (succeeded)
                    {
                        MessageBox.Show("Done!", "TimetableGrabber - SIT", MessageBoxButton.OK, MessageBoxImage.Information);
                    }
                    else
                        MessageBox.Show("Something went wrong!", "TimetableGrabber - SIT", MessageBoxButton.OK, MessageBoxImage.Error);
                }
            }

            ButtonStart.IsEnabled = true;
            TextBoxUsername.IsEnabled = true;
            PasswordBoxPassword.IsEnabled = true;
        }

        public async Task Log(string logMessage)
        {
            await TextBoxLogs.Dispatcher.BeginInvoke(new Action(() =>
            {
                TextBoxLogs.AppendText(string.Format("[{0}]: {1}{2}", DateTime.Now.ToShortTimeString(), logMessage, Environment.NewLine));
                TextBoxLogs.ScrollToEnd();
            }));
        }

        public async Task SetStatus(string status)
        {
            await LabelStatus.Dispatcher.BeginInvoke(new Action(() =>
            {
                LabelStatus.Content = status;
            }));
        }

        public string OpenSelectionPrompt(params string[] text)
        {
            selectionWindow = new SelectionWindow(text);
            selectionWindow.Owner = this;
            selectionWindow.WindowStartupLocation = WindowStartupLocation.CenterOwner;
            selectionWindow.ShowDialog();
            return selectionWindow.IdIdentifier;
        }
    }
}
