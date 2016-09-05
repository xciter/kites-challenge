
/*******************************************************************************
 *
 * A blank reference implementation exists below. Replace it with your
 * implementation.
 *
 *                                                                        [n=80]
 ******************************************************************************/

module.exports = (function() {
  "use strict";

  var hours = {}


  hours.parse = function(text) {
    var open_days = [];
    open_days = find_hours(text);
    return generate_result(open_days);
  }

  /*
  Function that finds days of week and hours range using regexp
  
  @param {string} text input in human readable form
  */
  function find_hours(text) {
    // RegExp pattern
    var pattern = /(?:(Mon|Tue|Wed|Thu|Fri|Sat|Sun)\S*\s*(to|-)\s*(Mon|Tue|Wed|Thu|Fri|Sat|Sun)\D*(Mon|Tue|Wed|Thu|Fri|Sat|Sun)|(Mon|Tue|Wed|Thu|Fri|Sat|Sun)\S*\s*(to|-)\s*(Mon|Tue|Wed|Thu|Fri|Sat|Sun)|(Mon|Tue|Wed|Thu|Fri|Sat|Sun))\D*(?:(\d+:\d{2})\s*(?:-|to)\s*(\d+:\d{2})|(\d{4})\s*(?:-|to)\s*(\d{4}))\W*(?:(\d+:\d{2})\s*(?:-|to)\s*(\d+:\d{2})|(\d{4}\s*)(?:-|to)(\d{4}))*/g;
    var extracted_info = [];
    var match;
    // for each match extract information in machine readable form
    while (match = pattern.exec(text)){
      extracted_info.push(extract_hours(match));
    }
    return extracted_info;
  }

  /*
  Function that extracts information of working days and hours in machine readable form
  
  @param {array} item match found using regex
  */
  function extract_hours(item) {
    var days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    var open_days = [];
    var has_day_range = false;
    var start_day = -1;
    var end_day = -1;
    var more_days = [];
    var hour_ranges = [];

    // delete all NaN and undefined from matched array
    item = item.filter(function(n){ return n != undefined });

    // convert days from string to int
    for (var idx = 0; idx < item.length; ++idx) {
      if (days.indexOf(item[idx]) != -1) {
        if (start_day == -1) {
          start_day = days.indexOf(item[idx]);  // starting day for range (eg. Mon-Fri, start_day is Mon)
        }
        else if (has_day_range && end_day == -1) {
          end_day = days.indexOf(item[idx]);    // ending day for range (eg. Mon-Fri, end_day is Fri)
        }
        else if (end_day != -1) {
          more_days.push(days.indexOf(item[idx]));  // add additional days for combined cases
        }
      }

      else if (["to", "-"].indexOf(item[idx]) != -1) {
        has_day_range = true;                  // if "to" or "-" is found in regex between days, find range (eg. Mon-Fri)
      }

      // Convert timestamps from xx:xx to xxxx format
      else if (!isNaN(item[idx].replace(":", ""))) {
        var value = item[idx].replace(":", "");
        if (value.length == 3) value = "0" + value;  // convert timestamp from xxx to 0xxx
        hour_ranges.push(value);
      }

      // if range of days is Mon-Sun, convert to Sun-Sat
      if (end_day == 0 && start_day == 1) {
        end_day = 6;
        start_day = 0;
      }
    }

    // generate machine output according to challenge and add to result array
    open_days.push(generate_machine_output(start_day, end_day, more_days, hour_ranges));

    return open_days;
  }

  /*
  Function that combined found information into machine output described in the task
  
  @param {integer} start Start day in range
  @param {integer} finish End day in range
  @param {array} additional_days additional days out of range
  @param {array} hour_ranges array of all found hours
  */
  function generate_machine_output(start, finish, additional_days, hour_ranges){
    var output = "";

    // add starting day to result output
    output += start;

    // add end day to result output if there is a range of days
    if (finish != -1)
      output += '-' + finish;

    // add additional days to result output
    if (additional_days.length != 0){
      for (var idx=0; idx<additional_days.length; ++idx) {
        var day = additional_days[idx];
        if (day-start == -1){
          output = output.replace(start, day);    // Replace start day of range if additional day is consecutive
          start = day;
        }
        else if (day-finish == 1){
          output = output.replace(finish, day);   // Replace end day of range if additional day is consecutive
          finish = day;
        }
        else if (day < start){
          output = day + ',' + output;
        }

        else if (day > finish){
          output += ',' + finish;
        }
      }
    }

    output += ':';

    // add hours range to result output
    output += combine_hours(hour_ranges);

    return output;
  }

  /*
  Function that combines hours from array to ranges
  
  @param {array} hour_array array of all found hours
  */
  function combine_hours(hour_array) {
    var hour_ranges = [];
    var output = "";
    
    // iterate hours by pairs 
    for (var idx=0; idx<hour_array.length; idx+=2){
      var first = hour_array[idx];
      var second = hour_array[idx+1];
      if (second < first)
        second = (parseInt(second) + 2400).toString();    // if closing hour is in form 0xxx add 24 hours (eg. 1700-0100 to 1700-2500)
      hour_ranges.push([first, second]);
    }

    // sort hour ranges
    hour_ranges.sort();

    var start = hour_ranges[0][0];
    var finish = hour_ranges[0][1];

    // combine hour ranges if they are consecutive
    for (var idx=0; idx<hour_ranges.length; ++idx) {
      if (hour_ranges[idx][0] <= finish) {
        if (hour_ranges[idx][1] > finish) {
          finish = hour_ranges[idx][1];
        }
      }
      else {
        output += start + '-' + finish + ',';
        start = hour_ranges[idx][0];
        finish = hour_ranges[idx][1];
      }
    }

    output += start + '-' + finish;
    return output;
  }

  /*
  Function that generates output from all matches
  
  @param {array} open_days array of matches in machine readable format
  */
  function generate_result(open_days) {
    var output = 'S';
    open_days.sort();
    for (var idx=0; idx<open_days.length; ++idx){
      output += open_days[idx] + ';';
    }
    return output.slice(0, -1);
  }

  return hours

}());
