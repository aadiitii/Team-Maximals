function functionJs() {
    const intro=introJs();

intro.setOptions({
    steps: [
        {  
            element: '#logo',
            intro: 'Welcome to Path Finding Visualizer'
        },
        {
            element: '#tableContainer',
            intro: 'This is your main playground.First, select the Starting loctation.Then select the Ending Location.If you want to add restrictions/inaccessible locations, then add walls '
        },
        {
            element: '#algorithms',
            intro: 'Choose an algorithm of your choice!'
        },
        {
            element: '#speed',
            intro: ' Choose your desired speed for visualizing the output'
        },
        {
            element: '#startBtn',
            intro: 'Click this button to visualize your problem!'
        },
        {
            element: '#results',
            intro: 'make sure to keep check of this box to know the results! '
        },
        {
            element: '#clearBtn',
            intro: 'Wanna try again? CLEAR the board! '
        },
        {
            element: '#colorCodes',
            intro: 'Color codes to help you!'
        }
        

    ]
})

intro.start();
    
}