using System;
using System.Collections.Generic;
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
        private IN4SIT in4sit;

        public MainWindow()
        {
            InitializeComponent();
            in4sit = new IN4SIT(this);
        }

        private async void ButtonStart_Click(object sender, RoutedEventArgs e)
        {
            string username = TextBoxUsername.Text;
            string password = PasswordBoxPassword.Password;

            if (String.IsNullOrWhiteSpace(username) || String.IsNullOrWhiteSpace(password))
                MessageBox.Show("Please enter your username or password!", "TimetableGrabber - SIT", MessageBoxButton.OK, MessageBoxImage.Error);
            else
            {
                bool succeeded = await Task.Run(() => in4sit.Start(username, password));//in4sit.Start(TextBoxUsername.Text, PasswordBoxPassword.Password));
                if (succeeded)
                {
                    MessageBox.Show("Your timetable has been exported!", "TimetableGrabber - SIT", MessageBoxButton.OK, MessageBoxImage.Information);
                }
                else
                    MessageBox.Show("Something went wrong!", "TimetableGrabber - SIT", MessageBoxButton.OK, MessageBoxImage.Error);
            }
        }

        public async Task Log(string logMessage)
        {
            await TextBoxLogs.Dispatcher.BeginInvoke(new Action(() =>
            {
                TextBoxLogs.AppendText(String.Format("[{0}]: {1}\n", DateTime.Now.ToShortTimeString(), logMessage));
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
    }
}
