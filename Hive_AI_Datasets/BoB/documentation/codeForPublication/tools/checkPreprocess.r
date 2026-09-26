source("tools/plot.r")
years <- c(2019,2020,2021,2022)

for(year in years){
  try({
    path <- paste("data/", year, "/preprocessed/", year, "_m/", sep = "")
    files <- list.files(path)
    long_files <- paste(path, files, sep="")
    
    csvs <- lapply(long_files, read.csv)
    keys <- sub(".csv", "", files)
    
    mapply(plot_key, csvs, keys, MoreArgs = list(year=year, folder="preprocessed", variables=config_covariates))
  })
}



