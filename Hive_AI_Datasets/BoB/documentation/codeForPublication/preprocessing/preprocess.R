library(zoo)
library(tsfeatures)
library(slider)
library(imputeTS)
library(PMCMRplus)


pre_inspections <- function(insp){
  # change timestamps for swarms
  #offsets <- list()
  # omitted for anonymisation
  for(o in 1:length(offsets)){
    true_i <- which(insp$key==names(offsets)[o] & insp$swarming==1)
    insp$created_at[true_i] <-  insp$created_at[true_i] + offsets[[o]]
  }
  
  # omitted for anonymisation
  
  return(insp)
}


manual_deselect <- function(df, key, info_df, sensors= config_sensors){
  df <- df[rowSums(is.na(df))<length(sensors), ]
  df$time <- as.POSIXct(df$time)
  df <- df[df$time>=info_df$start[info_df$key==key] & df$time<=info_df$stop[info_df$key==key],] 
  return(df)
}

add_missing_time_information <- function(df){
  # if time stamps are missing, these are added
  # a numeric time column is introduced
  print_debug(paste("dftime", class(df$time), length(df$time)))
  df$time <- as.POSIXct(df$time)
  df$month <- month(df$time)
  df$year <- year(df$time)
  df$hour <- hour(df$time)
  df$minute <- minute(df$time)
  df$second <- second(df$time)
  df$uni_time <- as.POSIXct(paste("1111-", df$month, "-", df$day, " ", 
                                  df$hour, ":", df$minute, ":", df$second, sep = ""), format="%Y-%m-%d %H:%M:%OS")
  df$numeric.time <- as.numeric(row.names(df))
  return(df)
}

filter_errors <- function(df){
  # make sure the values are not crazy:
  df$weight_kg[df$weight_kg>150|df$weight_kg<(-50)] <- NA
  df$h[df$h>100|df$h<0] <- NA
  df$t[df$t>85|df$t<(-40)] <- NA
  temps <- c("t_i_1","t_i_2","t_i_3","t_i_4","t_i_5","t_o")
  for(j in 1:length(temps)){
    col <- df[,temps[j]]
    df[,temps[j]][col>85|col<(-40)] <- NA
  }
  return(df)
}

temp_differentials <- function(df){
  # compute various temperature differentials
  # t minus t_o
  df$t_diff_1 <- df$t - df$t_o
  # max of thermometers minus t_o
  t_max <- pmax(df$t_i_1, df$t_i_2, df$t_i_3, df$t_i_4, df$t_i_5, na.rm = T)
  df$t_diff_2 <- t_max - df$t_o
  return(df)
}

temp_correlations <- function(df, days = 3){
  # compute rolling temperature correlation
  # t vs t_o
  df$t_cor_1 <- slide2_dbl(df$t, df$t_o, ~cor(.x, .y, use = "everything"), 
                           .before = 24 * days)
  
  # max of thermometers vs t_o
  t_max <- pmax(df$t_i_1, df$t_i_2, df$t_i_3, df$t_i_4, df$t_i_5, na.rm = T)
  df$t_cor_2 <- slide2_dbl(t_max, df$t_o, ~cor(.x, .y, use = "everything"), 
                           .before = 24 * days)
  return(df)
}

impute_missing_values <- function(df, sensors = config_sensors){
  for(i in 1:length(sensors)){
    try({
      #df[,sensors[i]] <-  na_kalman(df[,sensors[i]], model = "auto.arima")
      # use simple linear interpolation for now
      if (sum(!is.na(df[,sensors[i]])) > 1){ # error messages are annoying...
        df[,paste(sensors[i], "_notInterpolated", sep = "")] <- df[, sensors[i]]
        df[,sensors[i]] <-  na_interpolation(df[,sensors[i]], option ="linear")
      }
    })
  }
  return(df)
}

transform_weight_information<- function(df, limit = 0.3, interval_minutes = 1){ 
  # creates following new columns:
  # df$weight_delta : the difference in weight to the last measurements
  # df$weight_delta_noOutlier: weight_delta without values higher than limit
  #                           or lower than limit*-1, they are set to 0
  # df$weight_kg_noOutlier: recalculated from weight_delta_noOutlier
  
  
  # calculate delta
  df$weight_delta <- c(0, diff(df$weight_kg))
  # because we did not apply pad in the beginning,
  # we mark the rows, where a preceding measurement is available
  df$no_jump <- (df$time - 60*interval_minutes) == dplyr::lag(df$time)
  # we set weight_deltas after a jump to NA
  df$weight_delta[!df$no_jump] <- NA
  # marking outlier
  df$outlier_lim <- !is.na(df$weight_delta) & (df$weight_delta > limit | df$weight_delta < (-1*limit))
  # creating weight_delta without outlier, setting those to 0
  df$weight_delta_noOutlier <- df$weight_delta
  df[df$outlier_lim,"weight_delta_noOutlier"] <- 0
  # creating new column for cleaned weight
  df$weight_kg_noOutlier <- rep(NA, nrow(df))
  # removing jump-nas. here is a point where it could make more sense, to keep this
  df$with_0 <- df$weight_delta_noOutlier
  df$with_0[is.na(df$with_0)] <- 0
  # calculate cleaned weight
  df$weight_kg_noOutlier <- diffinv(df$with_0)[2:(nrow(df)+1)] 
  df$weight_kg_noOutlier[is.na(df$weight_kg)] <- NA
  return(df)
}




merge_insp <- function(df, insp=config.insp, labels=config_insp_labels){
  print_debug("in merge_insp")

  key <- df$key[1]
  print_debug(key)
  print_debug(class(insp$key))
  print_debug(levels(insp$key))
  for(l in 1:length(labels)){
    print_debug(l)
    # add label columns
    #print_debug(nrow(sub))
    #print_debug(summary(insp$key))
    #print_debug(summary(key))
    sub <- insp[(!is.na(insp[,labels[l]]) & (insp[,labels[l]] == 1)) & as.character(insp$key) == key,]
    sub <- sub[!is.na(sub$created_at),]
    if(!(nrow(sub)==0)){
      sub <- sub[order(sub$created_at),]
      #df.sub <- df[df$key == keys[k], ]
      time.points <- sub$created_at
      for(t in 1:length(time.points)){
        df[df$time >= time.points[t], paste(labels[l], ".last", sep="")] <- time.points[t] 
      } 
      sub <- sub[order(sub$created_at, decreasing = T),]
      time.points <- sub$created_at
      for(t in 1:length(time.points)){
        df[df$time <= time.points[t], paste(labels[l], ".next", sep="")] <- time.points[t] 
      } 
      df[,paste(labels[l], ".last.dif", sep = "")] <- df$time - df[,paste(labels[l], ".last", sep = "")]
      df[,paste(labels[l], ".next.dif", sep = "")] <- df[,paste(labels[l], ".next", sep = "")] - df$time
    }else{
      df[, paste(labels[l], ".last", sep="")] <- rep(NA, nrow(df))
      df[, paste(labels[l], ".next", sep="")] <- rep(NA, nrow(df))
      df[, paste(labels[l], ".last.dif", sep = "")] <- rep(NA, nrow(df))
      df[, paste(labels[l], ".next.dif", sep = "")] <- rep(NA, nrow(df))
    }
  }
  print_debug("all label done")
  # add long lat columns
  some <- insp[as.character(insp$key) == key,]
  df$lon <- rep(some$coordinate_lon[1], nrow(df))
  df$lat <- rep(some$coordinate_lat[1], nrow(df))
  
  return(df)
}


prepare_ts_features <- function(dataset, ts_names = c('weight_kg', 'weight_delta', 'weight_delta_noOutlier', 'weight_kg_noOffset', 'weight_kg_noOffset_noOutlier', 't_i_1', 't_i_2', 't_i_3', 't_i_4', 't_i_5', 't_o', 'p', 'h'), ts_features =  c("frequency", "stl_features", "entropy", "acf_features"), timeframe = 21) {
  
  # gets time series features as computed by tsfeatures::tsfeatures()
  # result is tibble with dimensions:
  # rows: (length(unique(dataset$key))
  # columns: (length(ts_features) * length(ts_names))
  #
  # default is configured for the (current) sensor event datasets with timeframe 3 weeks before event 
  # time series columns choosable, as well as features and custom timeframe: some ts features might be interesting for the whole 3 weeks, in some cases it might be interesting how ts behaves just 3 days before event (e.g. some temperature features). use this function in both ways and cbind the resulting dfs.
  # time series NAs should already have been handled before using this function
  # if there are NAs in any of the ts, they will be replaced by the time series mean or 0 in case of more than 90% NAs
  #
  # dataset = data frame or tibble with time series in wide format, must contain a column named "key"
  # ts_names = names of time series columns to be processed
  # ts_features = time series features to be computed. see tsfeatures documentation for full list: https://cran.r-project.org/web/packages/tsfeatures/tsfeatures.pdf
  # timeframe = days to end of time series to be used for processing
  
  feature_tibble_rowwise <- tibble()
  feature_tibble_final <- tibble(.rows = length(unique(dataset$key)))
  keys <- unique(dataset$key)
  for (i in 1:length(ts_names)) {
    pred_tibble_rowwise <- tibble()
    for (j in 1:length(keys)) {
      time_series <- zoo(dataset[dataset$key == keys[j], ts_names[i]], dataset[dataset$key == keys[j],]$time)
      time_series <- tail(time_series, timeframe * 24)
      if (is.na(time_series)) {
        time_series <- replace_na(time_series, 0)
      } else if (sum(is.na(time_series)) / length(time_series) > .9) {
        time_series <- zoo(rep(0,nrow(dataset[dataset$key == keys[j]])), dataset[dataset$key == keys[j],]$time)
      } else if (any(is.na(time_series))) {
        time_series <- replace_na(time_series, mean(time_series))
      }
      features_ts <- tsfeatures(time_series, features=ts_features)
      names(features_ts) <- paste(names(features_ts), ts_names[i], as.character(timeframe), '_days', sep='_')
      feature_tibble_rowwise <- rbind(feature_tibble_rowwise, features_ts)
    }
    feature_tibble_final <- tibble(cbind(feature_tibble_final, feature_tibble_rowwise))
  }
  
  feature_tibble_final['key'] <- keys
  feature_tibble_final['target'] <- sapply(keys, function(x) dataset[dataset$key == x,]$group[1])
  
  return(feature_tibble_final)
  
}

transform_weight_delta_day <- function(df){
  df$weight_delta_day <- c(df$weight_delta_day[2:nrow(df)], NA)
  return(df)
}

