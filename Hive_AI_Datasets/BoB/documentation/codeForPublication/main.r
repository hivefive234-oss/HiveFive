
library(lubridate)

source("tools/getData.r")
source("main/config.r")
source("preprocessing/preprocess.R")
source("tools/plot.r")

# prepare inspection data
source("preprocessing/prepare_inspections.R")

# get inspection data
vor_insp <- get_inspection()

# preprocess inspection data, adjust times, etc
config.insp <- insp <- pre_inspections(vor_insp)


if(config_read_raw){
  key_dict <- read.csv("data/key_dict.csv")
  keys <- lapply(years, create.preprocessed.keys)
  
  for(i in 1:length(years)){
    keysub <- keys[[i]]
    for(key in keysub){
      get_sensor_data_year_key(years[i], key, agg= "raw", dir_dest="raw_data", key_dict_param=key_dict)    
    }
  }
}

# read data for all years
if(config_read_data){
  keys <- lapply(years, create.preprocessed.keys)
  
  for(i in 1:length(years)){
    keysub <- keys[[i]]
    for(key in keysub){
      get_sensor_data_year_key(years[i], key, agg= "m")    
    }
  }
}



# preprocess data for all years
if(config_preprocess){
  info_files <- list.files(info_dir)
  info_files_long <- paste(info_dir, info_files, sep="")
  infos <- lapply(info_files_long, read.csv)
  for(i in 1:length(years)){
    year <- years[i]
    info <- infos[[i]]
    for(agg in c("m")){
      dir <- paste("data/", year, "/raw/", year, "_", agg, "/", sep = "")
      pre_dir <- paste("data/", year, "/preprocessed/", paste(year, "_", agg, sep=""), "/", sep = "")
      dir.create(file.path("data", year, "preprocessed"))
      dir.create(file.path("data", year, "preprocessed", paste(year, "_", agg, sep="")))
      read_all(dir, pre_dir, config_preprocess_functions, info)
    }
  }
}

# plot all data sets with 1-minute interval for a visual inspection
if(config_check_preprocess){
  source("tools/checkPreprocess.r")
}

# read data for all events
if(config_read_event){
  info_all <- read.csv(file = info_all_dir)
  for(event in config_events){
    # get event colonies
    timestamps <- create_sensor_event(insp = insp, event = event, key_info= info_all, weeks = 4*3, agg="m")
    # get no-event colonies
    for(stamp in timestamps){
      create_sensor_all(insp = insp, 
                        event = event,
                        no_event = paste("not_", event, sep=""), 
                        time = as.POSIXct(stamp, origin= "1970-01-01"), 
                        key_info = info_all,
                        weeks = 4*3,
                        agg="m") 
    }
  }
}

# preprocess data for all events
if(config_preprocess_event){
  set.seed(123)
  info <- read.csv(file = info_all_dir)
  for(event in config_events){
    dir <- paste("data/", event, "/raw/", sep = "")
    pre_dir <- paste("data/", event, "/preprocessed/", event, "_m/", sep = "")
    dir.create(file.path("data", event, "preprocessed", paste(event, "_m", sep = "")), recursive = T)
    
    read_all(dir, pre_dir, config_preprocess_functions, info, delete_duplicate=T)
    
    dir <- paste("data/not_", event, "/raw/", sep = "")
    pre_dir <- paste("data/not_", event, "/preprocessed/not_", event, "_m/", sep = "")
    dir.create(file.path("data", paste("not_", event, sep=""), "preprocessed", paste("not_", event, "_m", sep = "")), recursive = T)
    
    read_all(dir, pre_dir, config_preprocess_functions, info, delete_duplicate=T)
  }
  
}

if(config_prepare_publication){
  source("tools/prepare_for_publication.r")
}

# plot single colonies per year
if(config_plot_year_single){
  for(year in years){
    dir <- paste("publication_data/", year, "/preprocessed/", year, "_d/", sep = "")
    files <- list.files(dir)
    long_files <- paste(dir, files, sep = "")
    dfs <- lapply(long_files, read.csv)
    
    for(d in 1:length(dfs)){
      df <- dfs[[d]]
      df$time <- as.POSIXct(df$time)
      plot_key(df, df$key[1], year, variables=config_covariates, folder=paste(year, "_single", sep=""), 
               ylabs = paste(config_covariates, config_units))
    }
  }
}


# plot single events
if(config_plot_event_single){
  for(event in config_events){
    dir <- paste("publication_data/", event, "/preprocessed/", event, "_h/", sep = "")
    files <- list.files(dir)
    long_files <- paste(dir, files, sep = "")
    dfs <- lapply(long_files, read.csv)
    
    for(d in 1:length(dfs)){
      df <- dfs[[d]]
      df$time_dist_event <- df$time_dist_event/(60*60)
      df <- df[df$time_dist_event>-48 & df$time_dist_event<48,]
      plot_key(df, df$key[1], event, variables=config_covariates, folder=event, 
               x="time_dist_event", timestamp=df$event[1], 
               ylabs = paste(config_covariates, config_units),
               xlabs = "distance to event in time (hours)",
               use_breaks=T)
    }
  }
}

# plot per event ribbon
if(config_plot_event){
  for(event in config_events){
    dir <- paste("publication_data/", event, "/preprocessed/", event, "_h/", sep = "")
    files <- list.files(dir)
    long_files <- paste(dir, files, sep = "")
    dfs <- lapply(long_files, read.csv)
    positive <- do.call(rbind, dfs)
    positive$group <- rep("positive", nrow(positive))
    
    dir <- paste("publication_data/not_", event, "/preprocessed/", "not_", event, "_h/", sep = "")
    files <- list.files(dir)
    long_files <- paste(dir, files, sep = "")
    dfs <- lapply(long_files, read.csv)
    negative <- do.call(rbind, dfs)
    negative$group <- rep("negative", nrow(negative))
    
    all <- rbind(positive, negative)
    
    plot_events_sub_ribbon(all, event)
  }
  
}

