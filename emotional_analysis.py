from alchemyapi import AlchemyAPI
import json
import sys
import os

#transcript = sys.argv[1]

transcript = open("transcripts/Democrats/dem-1-17-2016.txt")
names = []
texts = [""] * 10
for line in transcript:
    for word in line.split():
        if word.isupper():
            if ':' in word:
                if word not in names:
                    names.append(word)
    for i in range(len(names)):
        if line.find(names[i]) > -1:
            texts[i] += line
                    
                
alchemyapi = AlchemyAPI()

for i in range(len(names)):
    response = alchemyapi.sentiment('text', texts[i])
    
    file_name = str(transcript) + '_sentiment'
    f = open(file_name, 'w')
    
    if response['status'] == 'OK':
        f.write(str(texts[i].split()[0]) + ' Sentiment')
        f.write('type: ', response['docSentiment']['type'])

        if 'score' in response['docSentiment']:
            f.write('score: ', response['docSentiment']['score'] + '\n')
    else:
        print('Error in sentiment analysis call: ',
              response['statusInfo'])
    


