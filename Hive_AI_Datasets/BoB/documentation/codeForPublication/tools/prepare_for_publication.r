replace_keys <- function(df, key_dict){
  if(nrow(key_dict)>=1 && df$key[1] %in% key_dict$ori_key){
    new_key <- key_dict$trans_key[key_dict$ori_key==df$key[1]]
  } else{
    if(nrow(key_dict)==0){
      new_key <- 0
    } else{
      new_key <- max(key_dict$trans_key)+1
    }
    key_dict <- rbind(key_dict, data.frame(ori_key=df$key[1], trans_key=new_key))
  }
  df$key <- rep(new_key, nrow(df))
  return(list(df=df, key_dict=key_dict, key = new_key))
}

change_names <- function(df){
  names(df)[names(df)=="weisel.last"] <- "queencell.last"
  names(df)[names(df)=="weisel.next"] <- "queencell.next"
  names(df)[names(df)=="weisel.last.dif"] <- "queencell.last.dif"
  names(df)[names(df)=="weisel.next.dif"] <- "queencell.next.dif"
  return(df)
}

aggregate_df <- function(df, floor='1 hour'){
  agged <- df %>%
    group_by(time=floor_date(time, floor)) %>%
    summarise_all(.funs = mean, na.rm=T)
  if("event" %in% names(agged)){
    agged$event <- rep(df$event[1], nrow(agged))
    agged$event <- as.POSIXct(agged$event)
    agged$time_dist_event <- difftime(agged$time, agged$event, units = "secs") 
  }
  return(agged)
}

dirs <- list.dirs("data")
pub_dirs <- paste("publication_", dirs, sep="")
for(dir in pub_dirs){
  dir.create(dir)
}

key_dict <- data.frame()
for(year in years){
  for(sub_dir in c("raw", "preprocessed")){
    dir <- paste("data", year, sub_dir, paste(year, "_m", sep = ""), sep = "/")
    pub_dir <- paste("publication_", dir, sep="")
    
    if(sub_dir == "preprocessed"){
      dir_h <- paste("publication_data", year, sub_dir, paste(year, "_h", sep = ""), sep = "/")
      dir.create(dir_h)
      dir_day <- paste("publication_data", year, sub_dir, paste(year, "_d", sep = ""), sep = "/")
      dir.create(dir_day)
    }
    
    files <- list.files(dir)
    long_files <- paste(dir,files,sep="/")
    csvs <- lapply(long_files, read.csv)
    keys <- sub(".csv", "", files)
    for(i in 1:length(csvs)){
      df <- csvs[[i]]
      df$time <- as.POSIXct(df$time)
      df$key <- rep(keys[i], nrow(df))
      both <- replace_keys(df, key_dict = key_dict)
      df <- both$df
      key_dict <- both$key_dict
      key <- both$key
      df <- change_names(df)
      publication_file <- paste(pub_dir, "/", key, ".csv", sep="")
      write.csv(df, publication_file)
      if(sub_dir == "preprocessed"){
        agged_h <- aggregate_df(df)
        file_h <- paste(dir_h, "/", key, ".csv", sep="")
        write.csv(agged_h, file_h)
        
        agged_day <- aggregate_df(df, "day")
        file_day <- paste(dir_day, "/", key, ".csv", sep="")
        write.csv(agged_day, file_day)
        
      }
    }
  }
}

both_events <- c(config_events, paste("not", config_events, sep="_"))

for(event in both_events){
  for(sub_dir in c("preprocessed", "raw")){
    
    if(sub_dir=="raw"){
      dir <- paste("data", event, sub_dir, sep = "/")
    }
    
    if(sub_dir == "preprocessed"){
      dir <- paste("data", event, sub_dir, paste(event, "_m", sep=""), sep = "/")
      dir_h <- paste("publication_data", event, sub_dir, paste(event, "_h", sep = ""), sep = "/")
      dir.create(dir_h)
      dir_day <- paste("publication_data", event, sub_dir, paste(event, "_d", sep = ""), sep = "/")
      dir.create(dir_day)
    }
    
    pub_dir <- paste("publication_", dir, sep="")
    
    files <- list.files(dir)
    long_files <- paste(dir,files,sep="/")
    csvs <- lapply(long_files, read.csv)
    keys <- sub("_.*.csv", "", files)
    times <- sub(".*_", "", files)
    for(i in 1:length(csvs)){
      df <- csvs[[i]]
      df$time <- as.POSIXct(df$time)
      df$key <- rep(keys[i], nrow(df))
      both <- replace_keys(df, key_dict = key_dict)
      df <- both$df
      key_dict <- both$key_dict
      key <- both$key
      df <- change_names(df)
      publication_file <- paste(pub_dir, "/", key, "_", times[i], sep="")
      write.csv(df, publication_file)
      if(sub_dir == "preprocessed"){
        agged_h <- aggregate_df(df)
        file_h <- paste(dir_h, "/", key, "_", times[i], sep="")
        write.csv(agged_h, file_h)
        
        agged_day <- aggregate_df(df, "day")
        file_day <- paste(dir_day, "/", key, "_", times[i], sep="")
        write.csv(agged_day, file_day)
        
      }
    }
  }
}

write.csv(key_dict, "data/key_dict.csv")

other_dirs <- c("data/wideJune23.csv", "data/dump_june_2023_rounded_coordinates.csv", "data/all_info.csv")
other_dirs <- c(other_dirs, paste("data/manual_select/", list.files("data/manual_select/"), sep=""))

for(dir in other_dirs){
  df <- read.csv(dir)
  repla <- data.frame()
  for(i in 1:nrow(df)){
    row <- df[i,]
    if(!is.null(row[i,"key"])){
      row <- replace_keys(row,key_dict)
    }
    repla <- rbind(repla, row$df)
  }
  write.csv(repla, paste("publication_", dir, sep = ""))
}

samp <- read.csv("publication_data/2020/preprocessed/2020_d/69.csv")
samp$time <- as.POSIXct(samp$time)

plot_key(samp, "69", 2020, folder = "sample")
