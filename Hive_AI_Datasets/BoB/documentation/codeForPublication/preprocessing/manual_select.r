source("tools/plot.r")
source("main/config.r")


##### Exclude Test Measurements 2019 #######

path <- "data/2019/raw/2019_h/"
files <- list.files(path)
long_files <- paste(path, files, sep="")

csvs <- lapply(long_files, read.csv)





info19 <- data.frame(key=c(), start=c())

# omitted for anonymisation

preprocess <- function(df, key){
  df <- df[rowSums(is.na(df))<length(config_sensors), ]
  df$time <- as.POSIXct(df$time)
  df <- df[df$time>=info19$start[info19$key==key] & df$time<=info19$stop[info19$key==key],] 
  #df <- df[1:50,]
  return(df)
}

keys <- sub(".csv", "", files)
choose <- keys %in% info19$key
keys <- keys[choose]
csvs <- csvs[choose]

csvs <- mapply(preprocess, csvs, keys, SIMPLIFY = F)

mapply(plot_key, csvs, keys, MoreArgs = list(year=2019, variables="weight_kg"))

##### Exclude Test Measurements 2020 #######


path <- "data/2020/raw/2020_h/"
files <- list.files(path)
long_files <- paste(path, files, sep="")

csvs <- lapply(long_files, read.csv)



info20 <- data.frame(key=c(), start=c())

# omitted for anonymisation

preprocess <- function(df, key){
  df <- df[rowSums(is.na(df))<length(config_sensors), ]
  df$time <- as.POSIXct(df$time)
  df <- df[df$time>=info20$start[info20$key==key] & df$time<=info20$stop[info20$key==key],] 
  #df <- df[1:200,]
  return(df)
}

keys <- sub(".csv", "", files)
choose <- keys %in% info20$key
keys <- keys[choose]
csvs <- csvs[choose]

csvs <- mapply(preprocess, csvs, keys, SIMPLIFY = F)

mapply(plot_key, csvs, keys, MoreArgs = list(year=2020, variables="weight_kg"))

##### Exclude Test Measurements 2021 #######


path <- "data/2021/raw/2021_h/"
files <- list.files(path)
long_files <- paste(path, files, sep="")

csvs <- lapply(long_files, read.csv)



info21 <- data.frame(key=c(), start=c())

# omitted for anonymisation


preprocess <- function(df, key){
  df <- df[rowSums(is.na(df))<length(config_sensors), ]
  df$time <- as.POSIXct(df$time)
  df <- df[df$time>=info21$start[info21$key==key] & df$time<=info21$stop[info21$key==key],] 
  #df <- df[1:200,]
  return(df)
}

keys <- sub(".csv", "", files)
choose <- keys %in% info21$key
keys <- keys[choose]
csvs <- csvs[choose]

csvs <- mapply(preprocess, csvs, keys, SIMPLIFY = F)
#csvs <- lapply(csvs, function(df){df})



#lapply(csvs, FUN = plot_key, year=2019, key)
mapply(plot_key, csvs, keys, MoreArgs = list(year=2021, variables="weight_kg"))


##### Exclude Test Measurements 2022 #######


path <- "data/2022/raw/2022_h/"
files <- list.files(path)
long_files <- paste(path, files, sep="")

csvs <- lapply(long_files, read.csv)



info22 <- data.frame(key=c(), start=c())

# omitted for anonymisation

preprocess <- function(df, key){
  df <- df[rowSums(is.na(df))<length(config_sensors), ]
  df$time <- as.POSIXct(df$time)
  df <- df[df$time>=info22$start[info22$key==key] & df$time<=info22$stop[info22$key==key],] 
  #df <- df[1:200,]
  return(df)
}

keys <- sub(".csv", "", files)
choose <- keys %in% info22$key
keys <- keys[choose]
csvs <- csvs[choose]

csvs <- mapply(preprocess, csvs, keys, SIMPLIFY = F)
#csvs <- lapply(csvs, function(df){df})



#lapply(csvs, FUN = plot_key, year=2019, key)
mapply(plot_key, csvs, keys, MoreArgs = list(year=2022, variables="weight_kg"))


##################################################

write.csv(info19, "data/manual_select/info19.csv")
write.csv(info20, "data/manual_select/info20.csv")
write.csv(info21, "data/manual_select/info21.csv")
write.csv(info22, "data/manual_select/info22.csv")

#################################################

info_list <- list(info19,info20,info21,info22)
info_all <- Reduce(function(x, y) merge(x, y, by="key", suffixes=c(year(x$start[1]), year(y$start[1]))), info_list)

infos <- rbind(info19,info20,info21,info22)
summary_infos <- infos %>% 
  group_by(key) %>% 
  summarize(start = min(start), stop=max(stop))

write.csv(summary_infos, "data/manual_select/all_info.csv")
