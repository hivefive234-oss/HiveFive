source("tools/influx_json.R")



get_sensor_data_year <- function(year, type=year, sensors = config_sensors, agg="m", dir_dest="data"){ # todo agg in config
  # read sensor data 
  # saves data frame in data directory
  #
  # key : sensor-key of colony
  # time : beginning/ end of time series data of interest
  # type : used as sub-dir for saving
  # after : should data before or after time be read?
  # weeks : how many weeks of data should be read
  # name : file name of df

  select.string <- paste(sensors, collapse = "), median(")
  select.string <- paste("select median(", select.string, ")", sep = "")
  time.string <- paste("time > '", year, "-01-01 00:00:00' and time < '", year, "-12-31 23:59:00'", sep="")

  # use this for raw values. delete "group by time for that case"
  if(agg == "raw"){
    from.string <- paste("from sensors where ", time.string,
                         " GROUP BY \"key\" ", sep="")  
  }else{
    from.string <- paste("from sensors where ", time.string,
                         " GROUP BY time(1", agg, "), \"key\" ", sep="")  
  }
  select <- paste(select.string, from.string)
  print(select)
  try({
    df <- influx.read(select, "", "")
    if(nrow(df)!=0){
      names(df)[2:(1+length(sensors))] <- sensors
      dir <- paste(dir_dest, "/", type, sep="")
      dir.create(file.path(dir_dest, type))
      file <- paste(dir, "/", year, "_raw", 
                    ".csv", sep="")
      write.csv(df, file, row.names = F)
    }
  }) 
}

get_sensor_data_year_key <- function(year, key, type=year, sensors = config_sensors, agg="m", dir_dest="data", key_dict_param= NULL){ # todo agg in config
  # read sensor data 
  # saves data frame in data directory
  #
  # key : sensor-key of colony
  # time : beginning/ end of time series data of interest
  # type : used as sub-dir for saving
  # after : should data before or after time be read?
  # weeks : how many weeks of data should be read
  # name : file name of df
  
  if(agg == "raw"){
    select.string <- paste(sensors, collapse = ", ")
    select.string <- paste("select ", select.string, sep = "")
  } else{
    select.string <- paste(sensors, collapse = "), median(")
    select.string <- paste("select median(", select.string, ")", sep = "")
  }

  time.string <- paste("time > '", year, "-01-01 00:00:00' and time < '", year, "-12-31 23:59:00'", sep="")
  
  # use this for raw values. delete "group by time for that case"
  if(agg == "raw"){
    from.string <- paste("from sensors where ", time.string,
                         " and \"key\"= '", key, "'",
                         "", sep="")  
  }else{
    from.string <- paste("from sensors where ", time.string,
                       " and \"key\"= '", key, "'",
                       " GROUP BY time(1", agg, ")", sep="") 
  }
  select <- paste(select.string, from.string)
  print(select)
  try({
    df <- influx.read(select, "", "")
    if(nrow(df)!=0){
      if(!is.null(key_dict_param)){
        key <- key_dict_param$trans_key[key_dict_param$ori_key == key]
      }
      names(df)[2:(1+length(sensors))] <- sensors
      dir <- paste(dir_dest, "/", type, "/raw/", type, "_", agg, sep="")
      dir.create(file.path(dir_dest, type))
      dir.create(file.path(dir_dest, type, "raw"))
      dir.create(file.path(dir_dest, type, "raw", paste(type, "_", agg, sep="")))
      file <- paste(dir, "/", key, 
                    ".csv", sep="")
      write.csv(df, file, row.names = F)
    }
  }) 
}


create.preprocessed.keys <- function(year){
    time.string <- paste("time > '", year, "-01-01 00:00:00' and time < '", year, "-12-31 23:59:00'", sep="")
    query <- paste("select last(t_o), last(t_1), last(t_3),  last(h), last(weight_kg) from sensors 
    where ", time.string, " group by  \"key\" ", sep="")
    keys <- influx.read(query,
                        "", 
                        "", 
                        returnResult = F)
    keys <- keys$key
    #keys <- paste(keys, sep="")
  return(keys)
}

#create.preprocessed.keys(2019)


get_inspection <- function(){
  # read inspection data
  insp <- read.csv(wide_data)
  
  # hack, if beekeepers forgot to report in app but wrote an e-mail
  # died:
  insp <- add_missing_events(insp, also_died_key, also_died_date, "died")
  # swarmed:
  insp <- add_missing_events(insp, also_swarmed_key, also_swarmed_date, "swarming")
  
  insp$created_at <- ymd_hms(insp$created_at, tz="Europe/Berlin")
  insp$created_at <- with_tz(insp$created_at, tz="UTC")
  insp <- insp[!is.na(insp$created_at),]
  
  
  return(insp)
}



add_missing_events <- function(insp, also_key, also_date, event){
  # function to use for missing events, e.g.event which are specified in config 
  # hack, if beekeepers forgot to report in app but wrote an e-mail
  
  for(i in 1:length(also_date)){
    # add a new row, if it doesn't exist
    if(nrow(insp[insp$key == also_key[i] & insp$created_at == also_date[i],])==0){
      insp <- add_row(insp, key=also_key[i], created_at=also_date[i])
    }
    # add event
    insp[insp$key == also_key[i] & insp$created_at == also_date[i],event] <- 1
  }
  return(insp)
}

get_inspection_event <- function(insp, event){
  # get the inspections with a certain event listed
  events <- insp[insp[,event] & !is.na(insp[,event]) & insp$key != "NULL",]
  return(events)
}

get_inspection_deaths <- function(insp){
  # get the inspections with a listed colony loss
  return(get_inspection_event(insp, "died"))
}

get_inspection_swarms <- function(insp){
  # get inspections with a swarming event listed
  return(get_inspection_event(insp, "swarming"))
}

get_inspection_feeding <- function(insp){
  # get inspections with feeding event
  return(get_inspection_event(insp, "feeding"))
}

get_sensor_data <- function(key, time, type, after = F, weeks = 3, name=key,
                            sensors = config_sensors, agg="m"){ # todo agg in config
  # read sensor data 
  # saves data frame in data directory
  #
  # key : sensor-key of colony
  # time : beginning/ end of time series data of interest
  # type : used as sub-dir for saving
  # after : should data before or after time be read?
  # weeks : how many weeks of data should be read
  # name : file name of df
  orig.time <- time
  time <- time + 7*24*60*60
  weeks <- weeks+1
  select.string <- paste(sensors, collapse = "), median(")
  select.string <- paste("select median(", select.string, ")", sep = "")
  if(!after){
    time.string <- paste("time < '", time, "' and time > '", time, "' - ", 7*weeks, "d ", sep = "")
  } else{
    time.string <- paste("time > '", time, "' and time <'", time, "'+ ", 7*weeks, "d ", sep = "")
  }
  # use this for raw values. delete "group by time for that case"
  # select.string <- "select * "
  from.string <- paste("from sensors where ", time.string,
                       " and \"key\" = '", key, "' GROUP BY time(1", agg, ") ", sep="") # 
  select <- paste(select.string, from.string)
  print(select)
  written <- F
  try({
    df <- influx.read(select, "", "")
    if(nrow(df)!=0){
      names(df)[2:ncol(df)] <- sensors
      df$key <- rep(key, nrow(df))
      df$event <- rep(orig.time, nrow(df))
      dir <- paste("data/", type, "/raw/", sep="")
      dir.create(file.path("data", type))
      dir.create(file.path("data", type, "raw"))
      file <- paste(dir, "/", name, "_", 
                    strftime(time, format = "%Y-%m-%d %H%M%S"), # the colon is problematic in Windows...
                    ".csv", sep="")
      df$time_dist_event <- difftime(df$time, orig.time, units = "secs")
      write.csv(df, file, row.names = F)
      written <- T
    }
  }) 
  return(written)
}










get_other_keys <- function(time, not.in.keys){
  # get keys of colonies measuring at a certain time
  select.string <- "Select * from sensors where "
  time.string <- paste("time < '", time, "' +1h and time > '", time, "' - 1h", sep = "")
  select <- paste(select.string, time.string)
  keys <- c()
  print(select)
  try({
    df <- influx.read(select, "", "")
    keys <- unique(df$key)
    keys <- keys[!(keys %in% not.in.keys)]
  }) 
  return(keys)
}


test_if_eventfree <- function(date, other_dates, after = F, weeks = 3){
  # test if given dates are not in a certain period
  # important for example to test if data used as 
  # negative example is really free of that certain event
  date <- as.POSIXct(date)
  other_dates <- as.POSIXct(other_dates)
  interval <- 3600*24*7*weeks
  toReturn <- T
  if(length(other_dates)>0){
    if(!after){
      for(i in 1:length(other_dates)){
        if(date != other_dates[i] & date >= other_dates[i] & (date - interval) <= other_dates[i]){
          toReturn <- F
        }
      }
    } else {
      for(i in 1:other_dates){
        if(date != other_dates[i] & date <= other_dates[i] & date + interval >= other_dates[i]){
          toReturn <- F
        }
      }
    }
  } 
  return(toReturn)
}

create_sensor_event <- function(insp, event, key_info, after = F, weeks = 3, agg="h"){
  # create sensor data x weeks before or after a certain event
  # extracts events from inspection data and reads sensor data
  # saved to data directory
  # 
  # Parameters:
  # insp : inspection data
  # event : type of event, e.g. "died", "swarming", "feeding", according
  #          to columns of inspection data
  # no_key : keys not to be used, e.g. if they only were used for testing
  # after: should the data be read before or after the event
  # weeks: length of obtained timeseries data in weeks
  insp_sub <- get_inspection_event(insp, event)
  timestamps <- c()
  for(i in 1:nrow(insp_sub)){
    info_row <- key_info[key_info$key==insp_sub$key[i],]
    if(nrow(info_row)>=1 && insp_sub$created_at[i]>= info_row$start[1] && insp_sub$created_at[i]<= info_row$stop[1]){
      success <- get_sensor_data(insp_sub$key[i], insp_sub$created_at[i], event, after, weeks = weeks, agg=agg)
      if(success){
        timestamps <- c(timestamps, as.POSIXct(insp_sub$created_at[i], origin= "1970-01-01"))
      }
    }
  }
  return(timestamps)
}

create_sensor_no_event <- function(insp, event, no_event, dates_of_interest, 
                                   after = F, weeks = 3){
  # create sensor data of x weeks  without a certain event, saved to data directory
  # 
  # Parameters:
  # insp : inspection data
  # event : type of event, e.g. "died", "swarming", "feeding", according
  #          to columns of inspection data
  # dates_of_interest : which time periods should be considered?
  # after: should the data be read before or after the dates of interest
  # weeks: length of obtained timeseries data in weeks
  dates_of_interest <- ymd_hms(dates_of_interest, tz="Europe/Berlin")
  dates_of_interest <- with_tz(dates_of_interest, tz="UTC")
  insp_sub <- get_inspection_event(insp, event)
  for(i in 1:length(dates_of_interest)){
    time <- dates_of_interest[i]
    date <- as.POSIXct(time)
    other_keys <- get_other_keys(time, unique(insp_sub$key))
    for(k in 1:length(other_keys)){
      #if(test_if_eventfree(date, insp_sub$created_at[died$key == other.keys[k]])){ # doppelt gemoppelt hält besser
      get_sensor_data(other_keys[k], time, no_event, after, weeks = weeks) 
      #}
    }
  }
}


create_sensor_all <- function(insp, event, no_event, time, key_info, after=F, weeks = 3, agg="h"){
  # create sensor data of x weeks  without a certain event, saved to data directory
  # 
  # Parameters:
  # insp : inspection data
  # event : type of event, e.g. "died", "swarming", "feeding", according
  #          to columns of inspection data
  # after: should the data be read before or after the dates of interest
  # weeks: length of obtained timeseries data in weeks
  insp_sub <- get_inspection_event(insp, event)
  other_keys <- unique(insp$key)
  other_keys <- other_keys[!(other_keys %in% insp_sub$key)]
  for(k in 1:length(other_keys)){
    info_row <- key_info[key_info$key==other_keys[k],]
    if(nrow(info_row)>=1 && time>= info_row$start[1] && time<= info_row$stop[1]){
    #if(test_if_eventfree(date, insp_sub$created_at[died$key == other.keys[k]])){ # doppelt gemoppelt hält besser
      get_sensor_data(other_keys[k], time, no_event, after, weeks = weeks, agg=agg) 
    #
    }
  }
}


create_sensor_died <- function(insp, weeks = 8){
  # create sensor data of colonies that died (saved to data directory)
  #
  # Parameters
  # insp: inspection data
  # weeks: length of desired data
  create_sensor_event(insp = insp, event = "died", weeks = weeks)
  
}

create_sensor_no_died <- function(insp, weeks = 8){
  # create set of data without dying, saved to data directory
  #
  # Parameters
  # insp: inspection data
  # weeks: length of desired data
  dates_of_interest <- c("2020-01-09 12:00:00", "2020-03-17 12:00:00", "2020-10-09 12:00:00")
  create_sensor_no_event(insp = insp, 
                         event = "died",
                         no_event = "not_died", 
                         dates_of_interest = dates_of_interest, 
                         weeks = weeks)
  
  
  
} 


create_sensor_swarmed <- function(insp, weeks = 3){
  # create set of data with swarms, saved to data directory
  #
  # Parameters
  # insp: inspection data
  # weeks: length of desired data
  create_sensor_event(insp = insp, event = "swarming", weeks = weeks)
}

create_sensor_no_swarmed <- function(insp, weeks = 3){
  # create set of data without swarms, saved to data directory
  #
  # Parameters
  # insp: inspection data
  # weeks: length of desired data
  dates_of_interest <- c("2020-04-15 12:00:00", "2020-05-15 12:00:00", "2020-06-15 12:00:00")
  create_sensor_no_event(insp = insp, 
                         event = "swarming", 
                         no_event = "not_swarming", 
                         dates_of_interest = dates_of_interest, 
                         weeks = weeks)
} 


create_sensor_feeding <- function(insp, weeks = 1){
  # create set of data after feeding, saved to data directory
  #
  # Parameters
  # insp: inspection data
  # weeks: length of desired data
  create_sensor_event(insp = insp, 
                      event = "feeding", 
                      after = TRUE,
                      weeks = weeks)
}

create_sensor_no_feeding <- function(insp){
  # create set of data without feeding, saved to data directory
  #
  # Parameters
  # insp: inspection data
  # weeks: length of desired data
  #
  # currently with same colonies, 2 and 3 weeks before feeding
  feeding <- get_inspection_feeding(insp)
  for(i in 1:nrow(feeding)){
    for(w in 2:3){
      date <- as.POSIXct(feeding$created_at[i])
      if(test_if_eventfree(date, feeding$created_at[feeding$key == feeding$key[i]])){
        get_sensor_data(feeding$key[i], date - 3600*24*7*w , "not_feeding", after = TRUE, weeks = 1)
      }
    }
  }
}




read_all <- function(dir, pre_dir, preprocess_functions, info_df, delete_duplicate=F){
  # read all data frames in dir and apply preprocess_functions
  short_files <- list.files(dir)
  short_files <- short_files[short_files!="preprocessed"]
  #short_files <- short_files[1:10]#debug otion
  files <- paste(dir, "/", short_files, sep = "")
  keys <- sub(".csv", "", short_files)
  dfs <- lapply(files, read.csv)# debug option:  nrows=100
  if(delete_duplicate){
    keys <- sub("_.*.csv", "", short_files)
    ord <- sample(1:length(keys))
    keys <- keys[ord]
    dfs <- dfs[ord]
    keep <- c()
    saved <- data.frame()
    for(i in 1:length(keys)){
      start <- min(dfs[[i]]$time)
      stop <- max(dfs[[i]]$time)
      sub <- saved[saved$key==keys[i],]
      sub <- sub[sub$start <= start & sub$stop >= start|
                   sub$start <= stop & sub$stop >= stop,]
      if(nrow(sub)==0){
        keep <- c(keep, i)
        new_row <- data.frame(key=keys[i], start=start, stop=stop)
        saved <- rbind(new_row, saved)
      }
        
    }
    keys <- keys[keep]
    old_ord <- order(keys)
    keys <- keys[old_ord]
    short_files <- short_files[ord]
    short_files <- short_files[keep]
    short_files <- short_files[order(short_files)]
    
    dfs <- dfs[keep]
    dfs <- dfs[old_ord]

  }
  #dfs <- dfs[1:6]
  # sub_df <- function(df){
  #   return(df[1:50000,])
  # }
  # dfs <- lapply(dfs, sub_df)
  #print_debug(lapply(dfs, length))
  #manual_deselect(dfs[[2]], keys[[2]], info)
  dfs <- mapply(manual_deselect, dfs, keys, MoreArgs = list(info_df=info_df), SIMPLIFY = F)
  choose <- sapply(dfs, function(df)nrow(df)!=0)
  dfs <- dfs[choose]
  keys <- keys[choose]
  short_files <- short_files[choose]
  
  for(d in 1:length(dfs)){
    tmp <- dfs[[d]]
    tmp$key <- rep(keys[d], nrow(tmp))
    dfs[[d]] <- tmp
  }
  
  for(i in 1:length(preprocess_functions)){
    dfs <- lapply(dfs, preprocess_functions[i]) 
  }
  print("back in read all")
  print(pre_dir)
  print(length(dfs))
  own.write <- function(df, file){write.csv(df, paste(pre_dir, file, sep = ""))}
  mapply(FUN=own.write, df=dfs, file=short_files)
  # all <- do.call("rbind", dfs)
  #return(all)
}

#read_all("data/died",config_preprocess_functions)
#read_all("data/died",config_preprocess_functions)
create_combined_data <- function(type, 
                                 no_type, 
                                 dir = "data/", 
                                 subdir = "/weather/",
                                 forgot_preprocess= transform_weight_delta_day,
                                 file = paste(dir, type, "_all.csv", sep = "")){
  # combine data with a certain event and without a certain event to a single file
  #
  # Parameters:
  # type : name of data with event, as used for creating the data frames, also name of subdir
  # no_type : same as type but without event
  # dir : directory of data
  # file : path for new file
  
  
  positive.names <- list.files(paste(dir, type, subdir, sep = ""))
  negative.names <- list.files(paste(dir, no_type, subdir, sep = ""))
  
  positive.names <- paste(dir, type, subdir, positive.names, sep = "")
  negative.names <- paste(dir, no_type, subdir, negative.names, sep = "")
  
  positive <- lapply(positive.names, read.csv)
  negative <- lapply(negative.names, read.csv)
  
  positive <- lapply(positive, forgot_preprocess)
  negative <- lapply(negative, forgot_preprocess)
  
  positive <- do.call(rbind, positive)
  negative<- do.call(rbind, negative)
  
  positive$group <- rep("positive", nrow(positive))
  negative$group <- rep("negative", nrow(negative))
  
  all <- rbind(positive, negative)
  write.csv(all, file)
  
}
#mapply(FUN = create_combined_data, type= types, no_type = no_types)
#mapply(FUN = create_combined_data, type= types, no_type = no_types)
#mapply(FUN = create_combined_data, type= types, no_type = no_types)


#create_sensor_no_swarmed(insp)
#create_sensor_swarmed(insp)

get_combined_data <- function(type, dir = "data/", file = paste(dir, type, "_all.csv", sep = "")){
  # read and get a combined data file
  return(read.csv(file))
}

get_timeseries <- function(types, dir="data/", variables=config_variables, 
                           time.start=NULL, time.end=-60*60*1){
  tss <- list()
  meta_info <- data.frame()
  for(i in 1:length(types)){
    type <- types[i]
    type_dir <- paste(dir, type, "/preprocessed/", sep = "")
    files <- list.files(type_dir)
    long_files <- paste(type_dir, files, sep="")
    dfs <- lapply(long_files, read.csv)
    expected_length <- (time.end- time.start)/(60*60)+1
    get_time_frame <- function(df){
      if(!is.null(time.start)){
        df <- df[df$time_dist_event>=time.start,]
      }
      if(!is.null(time.end)){
        df <- df[df$time_dist_event<=time.end,]
      }
      if(is.na(df)||is.null(df)||nrow(df)<=(expected_length/2)){
        df <- NULL
      }
      return(df)
    }
    dfs <- lapply(dfs, get_time_frame)
    get_df <- function(df, variables){if(!is.null(df)){return(ts(df[,variables]))}
      else(return(NULL))}
    tss <- append(tss, lapply(dfs, get_df, variables=variables))
    meta_info <- rbind(meta_info, data.frame(files=files, 
                                             type= rep(type, length(files)),
                                             time.frame= rep(paste(time.start, time.end), length(files))))
  }
  meta_info <- meta_info[!sapply(tss, is.null),]
  tss <- tss[!sapply(tss, is.null)]
  return(list(meta_info=meta_info, tss=tss))
}









get_all_metas <- function(types, dir="data/", variables=config_variables, 
                          time.start=NULL, time.end=-60*60*1){
  tss <- list()
  meta_info <- data.frame()
  for(i in 1:length(types)){
    type <- types[i]
    type_dir <- paste(dir, type, "/preprocessed/", sep = "")
    files <- list.files(type_dir)
    meta_info <- rbind(meta_info, data.frame(files=files, 
                                             type= rep(type, length(files)),
                                             time.frame= rep(paste(time.start, time.end), length(files))))
  }
  return(list(meta_info=meta_info, tss=tss))
}



add_apiary_info <- function(tss, insp){
  if(is.null(tss)|length(tss$tss)==0){
    return(NULL)
  }
  meta <- tss$meta_info
  keys <-  sub("_.*", "", meta$files)
  dates <- sub(".csv", "", meta$files)
  meta$dates <- sub(".*_", "", dates)
  meta$locations <- rep(NA, nrow(meta))
  meta$lat <- rep(NA, nrow(meta))
  meta$lon <- rep(NA, nrow(meta))
  for(k in 1:length(keys)){
    sub <- insp[insp$key==keys[k],]
    if(nrow(sub)>0){
      meta$locations[k] <- sub$location_id[1]
      meta$lat[k] <- sub$coordinate_lat[1]
      meta$lon[k] <- sub$coordinate_lon[1]
    }
  }
  tss$meta_info <- meta
  tss$tss <- tss$tss[!is.na(tss$meta_info$locations)]
  tss$meta_info <- tss$meta_info[!is.na(tss$meta_info$locations),]
  return(tss)
}


