using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Data;
using System.Windows.Documents;
using System.Windows.Input;
using System.Windows.Media;
using System.Windows.Media.Imaging;
using System.Windows.Shapes;

namespace TimetableGrabber___SIT
{
    /// <summary>
    /// Interaction logic for SelectionWindow.xaml
    /// </summary>
    public partial class SelectionWindow : Window
    {
        public string IdIdentifier { get; set; } = string.Empty;
        public SelectionWindow(params string[] text)
        {
            InitializeComponent();

            Title = string.Format("TimetableGrabber - Selection");

            int choice = 0;
            foreach(string s in text)
            {
                Button newButton = new Button()
                {
                    Content = s,
                    Margin = new Thickness(5),
                    Padding = new Thickness(5),
                    Tag = choice
                };
                newButton.Click += Button1_Click;
                StackPanelButtons.Children.Add(newButton);
                choice++;
            }
        }

        private void Button1_Click(object sender, RoutedEventArgs e)
        {
            IdIdentifier = ((Button)sender).Tag.ToString();
            this.Close();
        }
    }
}
