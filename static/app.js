// reload MetaData
function reloadMeta(Data){
     var met = document.getElementById("sample_metadata");
    // Clear pre_existed metadata
    met.innerHTML = '';
    // Loop through all of the keys in the json response and
    // create new metadata tags
    for(var key in Data) {
        tag = document.createElement("h5");
        Content = document.createTextNode(`${key}: ${Data[key]}`);
        tag.append(Content);
        met.appendChild(tag);
    }
}

function buildCharts(sampleData, otuData) {
    // Loop through sample data and find the OTU Taxonomic Name
    var sampleValues = sampleData['sample_values'];
    var otuIDs = sampleData['otu_ids'];
    var labels = otuIDs.map(function(item) {
        return otuData[item]
    });
    // var OtuIDs = otuIDs.map(String)
    // Build Bubble Chart
    var bubbleLayout = {
        margin: { t: 0 },
        height: 800,
        width: 1200,
        hovermode: 'closest',
        xaxis: { title: 'OTU ID' }
    };
    var bubbleData = [{
        x: sampleData['otu_ids'],
        y: sampleData['sample_values'],
        text: labels,
        mode: 'markers',
        marker: {
            size: sampleData['sample_values'],
            color: sampleData['otu_ids'],
            colorscale: "Earth",
        }
    }];
    var BUBBLE = document.getElementById('Bubble');
    Plotly.plot(BUBBLE, bubbleData, bubbleLayout);
    // Build Pie Chart
    console.log(sampleData['sample_values'].slice(0, 10))
    var pieData = [{
        values: [sampleValues.slice(0, 10)],
        labels: [otuIDs.slice(0, 10)],
        hovertext: [labels.slice(0, 10)],
        hoverinfo: 'hovertext',
        type: 'pie'
    }];
    var pieLayout = {
        margin: { t: 0, l: 0 }
    };
    var PIE = document.getElementById('Pie');
    Plotly.plot(PIE, pieData, pieLayout);
};
function updateCharts(sampleData, otuData) {
    var sampleValues = sampleData['sample_values'];
    var otuIDs = sampleData['otu_ids'];
    // Return the OTU Description for each otuID in the dataset
    var labels = otuIDs.map(function(item) {
        return otuData[item]
    });
    // var OtuIDs = otuIDs.map(String)
    // Update the Bubble Chart with the new data
    var BUBBLE = document.getElementById('Bubble');
    Plotly.restyle(BUBBLE, 'x', [otuIDs]);
    Plotly.restyle(BUBBLE, 'y', [sampleValues]);
    Plotly.restyle(BUBBLE, 'text', [labels]);
    Plotly.restyle(BUBBLE, 'marker.size', [sampleValues]);
    Plotly.restyle(BUBBLE, 'marker.color', [otuIDs]);
    // Update the Pie Chart with the new data
    // Use slice to select only the top 10 OTUs for the pie chart
    var PIE = document.getElementById('Pie');
    var pieUpdate = {
        values: [sampleValues.slice(0, 10)],
        labels: [otuIDs.slice(0, 10)],
        hovertext: [labels.slice(0, 10)],
        hoverinfo: 'hovertext',
        type: 'pie'
    };
    Plotly.restyle(PIE, pieUpdate);
}
function getData(sample, callback) {
    // Use a request to grab the json data needed for all charts
    Plotly.d3.json(`/samples/${sample}`, function(error, sampleData) {
        if (error) return console.warn(error);
        Plotly.d3.json('/otu', function(error, otuData) {
            if (error) return console.warn(error);
            callback(sampleData, otuData);
        });
    });
    Plotly.d3.json(`/metadata/${sample}`, function(error, metaData) {
        if (error) return console.warn(error);
        reloadMeta(metaData);
    })
    // BONUS - Build the Gauge Chart
    buildGauge(sample);
}
function getOptions() {
    // Grab a reference to the dropdown select element
    var selDataset = document.getElementById('selDataset');
    // Use the list of sample names to populate the select options
    Plotly.d3.json('/names', function(error, sampleNames) {
        for (var i = 0; i < sampleNames.length;  i++) {
            var currentOption = document.createElement('option');
            currentOption.text = sampleNames[i];
            currentOption.value = sampleNames[i]
            selDataset.appendChild(currentOption);
        }
        getData(sampleNames[0], buildCharts);
    })
}
function optionChanged(newSample) {
    // Fetch new data each time a new sample is selected
    getData(newSample, updateCharts);
}
function init() {
    getOptions();
}
// Initialize the dashboard
init();


// build a Guage Graph
function buildGauge(sample) {
    Plotly.d3.json(`/wfreq/${sample}`, function(error, wfreq) {
        if (error) return console.warn(error);
        // rescale the washing frequency to range 0 - 180
        var level = wfreq * 20.0;

        var degrees = 180 - level,
            radius = .5;
        var radians = degrees * Math.PI / 180;
        var x = radius * Math.cos(radians);
        var y = radius * Math.sin(radians);

        var mainPath = 'M -.0 -0.05 L .0 0.05 L ',
            pathX = String(x),
            space = ' ',
            pathY = String(y),
            pathEnd = ' Z';
        var path = mainPath.concat(pathX,space,pathY,pathEnd);
        var data = [{ type: 'scatter',
        x: [0], y:[0],
            marker: {size: 12, color:'850000'},
            showlegend: false,
            name: 'Freq',
            text: level,
            hoverinfo: 'text+name'},
        { values: [50/9, 50/9, 50/9, 50/9, 50/9, 50/9, 50/9, 50/9, 50/9, 50],
        rotation: 90,
        text: ['8-9', '7-8', '6-7', '5-6', '4-5', '3-4', '2-3', '1-2', '0-1', ''],
        textinfo: 'text',
        textposition:'inside',
        marker: {
            colors:['rgba(0, 139, 51, 1)','rgba(0, 140, 76, 1)', 'rgba(0, 140, 76, 0.7)',
                    'rgba(14, 127, 0, .5)', 'rgba(110, 154, 22, .5)',
                     'rgba(170, 202, 42, .5)', 'rgba(202, 209, 95, .5)',
                     'rgba(210, 206, 145, .5)', 'rgba(232, 226, 202, .5)',
                     'rgba(255, 255, 255, 0)']},
        labels: ['8-9', '7-8', '6-7', '5-6', '4-5', '3-4', '2-3', '1-2', '0-1', ''],
        hoverinfo: 'label',
        hole: .5,
        type: 'pie',
        showlegend: false
        }];
        var layout = {
        shapes:[{
            type: 'path',
            path: path,
            fillcolor: '850000',
            line: {
                color: '850000'
            }
            }],
        title: '<b>Belly Button Washing Frequency</b> <br> Scrubs per Week',
        height: 500,
        width: 500,
        xaxis: {zeroline:false, showticklabels:false,
                    showgrid: false, range: [-1, 1]},
        yaxis: {zeroline:false, showticklabels:false,
                    showgrid: false, range: [-1, 1]}
        };
        var GAUGE = document.getElementById('Gauge');
        Plotly.newPlot(GAUGE, data, layout);
    });
}
