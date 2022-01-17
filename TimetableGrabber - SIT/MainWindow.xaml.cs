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

            in4sit = new IN4SIT();
        }

        private async void ButtonStart_Click(object sender, RoutedEventArgs e)
        {
            if (String.IsNullOrWhiteSpace(TextBoxUsername.Text) || String.IsNullOrWhiteSpace(PasswordBoxPassword.Password))
                MessageBox.Show("Please enter your username or password!", "TimetableGrabber - SIT", MessageBoxButton.OK, MessageBoxImage.Error);
            else 
            {
                bool chromeCreated = await in4sit.CreateChromeInstance();
                if (chromeCreated)
                {
                    bool loginSuccess = await in4sit.Login(TextBoxUsername.Text, PasswordBoxPassword.Password);
                    if (loginSuccess)
                    {
                        bool test1 = await in4sit.AccessCourseManagement();
                        bool test2 = await in4sit.AccessMyWeeklySchedule();
                        bool test3 = await in4sit.GoToTrimesterStartDate(TextBoxTrimesterStartDate.Text);
                        bool test4 = await in4sit.ScrapeSchedule();
                        bool close = await in4sit.CloseChromeInstance();
                    }
                    else
                        MessageBox.Show("Could not login to IN4SIT!", "TimetableGrabber - SIT", MessageBoxButton.OK, MessageBoxImage.Error);
                }
                else
                    MessageBox.Show("Chrome could not be started!", "TimetableGrabber - SIT", MessageBoxButton.OK, MessageBoxImage.Error);
            }
        }
    }
}
