import pandas as pd

data = pd.read_csv('static/volcanoes.csv').fillna("0°N")

data.Latitude
data.Longitude

def fn(row):
    lat = row.Latitude.split('°')
    long = row.Longitude.split('°')

    if lat[1] == 'S':
        lat[0] = float(lat[0]) * -1

    if long[1] == 'W':
        long[0] = float(long[0]) * -1

    #return {'lat':lat[0],'long':long[0]}
    return (lat[0],long[0])

#print(data.Latitude)

d = data.apply(fn, axis=1, result_type='expand')
print(d)

data[['lat','long']] = d

print(data['lat'])

data.to_csv('data/fixed_latlong.csv')

