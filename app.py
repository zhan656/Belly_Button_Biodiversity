# import necessary libraries
from sqlalchemy import func
import datetime as dt
import numpy as np
import pandas as pd

from flask import (
    Flask,
    render_template,
    jsonify,
    request,
    redirect)
from flask import Flask, jsonify, render_template, request, flash, redirect
from flask_sqlalchemy import SQLAlchemy

#################################################
# Flask Setup
#################################################
app = Flask(__name__)

#################################################
# Data Setup
#################################################
# Metadata
BB_Meta = pd.read_csv("DataSets/Belly_Button_Biodiversity_Metadata.csv")
BB_Meta_df = pd.DataFrame(BB_Meta)
# Fill NAN value with 0 in "AGE" & "WFREQ" Columns
for i in ["AGE" , "WFREQ"]:
    BB_Meta_df[i]=BB_Meta_df[i].fillna(0)
# Fill NAN value with "None" in "ETHNICITY", "GENDER", "BBTYPE" & "LOCATION" Column
for i in ["ETHNICITY", "GENDER", "BBTYPE" , "LOCATION"]:
    BB_Meta_df[i]=BB_Meta_df[i].fillna('None')

# otu_id
Otu_id = pd.read_csv("DataSets/Belly_Button_Biodiversity_otu_id.csv")
otu_id_df = pd.DataFrame(Otu_id)

#samples
Samples = pd.read_csv("DataSets/Belly_Button_Biodiversity_samples.csv")
samples_df = pd.DataFrame(Samples)
# Fill NAN values in 'samples' dataframe with 0
samples_df = samples_df.fillna(0)
#################################################
# Flask Routes
#################################################
@app.route("/")
# """Return the dashboard homepage."""
def home():
    return render_template("index.html")

@app.route('/names')
# """List of sample names.
# Returns a list of sample names in the format
# [
    # "BB_940",
    # "BB_941",
    # "BB_943",
    # "BB_944",
    # "BB_945",
    # "BB_946",
    # "BB_947",
    # ...
# ]

# """
def names():
    names = list(samples_df.columns.values)
    names = names[1:]
    return jsonify(names)

@app.route('/otu')
# """List of OTU descriptions.

# Returns a list of OTU descriptions in the following format

# [
    # "Archaea;Euryarchaeota;Halobacteria;Halobacteriales;Halobacteriaceae;Halococcus",
    # "Archaea;Euryarchaeota;Halobacteria;Halobacteriales;Halobacteriaceae;Halococcus",
    # "Bacteria",
    # "Bacteria",
    # "Bacteria",
    # ...
# ]
# """
def otu():
    description = list(otu_id_df.lowest_taxonomic_unit_found)
    return jsonify(description)
    
@app.route('/metadata/<sample>')
# """MetaData for a given sample.

# Args: Sample in the format: `BB_940`

# Returns a json dictionary of sample metadata in the format

# {
    # AGE: 24,
    # BBTYPE: "I",
    # ETHNICITY: "Caucasian",
    # GENDER: "F",
    # LOCATION: "Beaufort/NC",
    # SAMPLEID: 940
# }
# """
def meta(sample):
    sampleID = int(sample.split("_")[1])
    all_meta = BB_Meta_df[BB_Meta_df['SAMPLEID'] == sampleID]
    age = int(all_meta.AGE)
    BBTYPE = all_meta.iloc[0]["BBTYPE"]
    ETHNICITY = all_meta.iloc[0]["ETHNICITY"]
    gender = all_meta.iloc[0]["GENDER"]
    location = all_meta.iloc[0]["LOCATION"]
    sample_metadata = {}
    sample_metadata['SAMPLEID'] = sampleID
    sample_metadata['ETHNICITY'] = ETHNICITY
    sample_metadata['GENDER'] = gender.upper()
    sample_metadata['AGE'] = age
    sample_metadata['LOCATION'] = location
    sample_metadata['BBTYPE'] = BBTYPE.upper()
    return jsonify(sample_metadata)
    
    

@app.route('/wfreq/<sample>')
# """Weekly Washing Frequency as a number.

# Args: Sample in the format: `BB_940`

# Returns an integer value for the weekly washing frequency `WFREQ`

# """
def wfreq(sample):
    sampleID = int(sample.split("_")[1])
    all_meta = BB_Meta_df[BB_Meta_df['SAMPLEID'] == sampleID]
    wfreq = all_meta.iloc[0]["WFREQ"]
    return jsonify(int(wfreq))
    
@app.route('/samples/<sample>')
# """OTU IDs and Sample Values for a given sample.

# Sort your Pandas DataFrame (OTU ID and Sample Value)
# in Descending Order by Sample Value

# Return a list of dictionaries containing sorted lists  for `otu_ids`
# and `sample_values`

# [
    # {
        # otu_ids: [
            # 1166,
            # 2858,
            # 481,
            # ...
        # ],
        # sample_values: [
            # 163,
            # 126,
            # 113,
            # ...
        # ]
    # }
# ]
# """
def samples(sample):

    sort_samples_df = samples_df.sort_values(sample,ascending=False)
    otu_id = list(sort_samples_df.otu_id.astype(float))
    sample_values = list(sort_samples_df[sample].astype(float))
    #import pdb; pdb.set_trace()
    return jsonify({"otu_ids": otu_id, "sample_values": sample_values})
    
if __name__ == "__main__":
    app.run(debug=True)


##############################################################################################################33



