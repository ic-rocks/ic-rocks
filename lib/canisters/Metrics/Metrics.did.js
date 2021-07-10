const Metrics = ({ IDL }) => {
  const AttributeId = IDL.Nat;
  const Status = IDL.Variant({ active: IDL.Null, paused: IDL.Null });
  const Period = IDL.Variant({
    Day: IDL.Null,
    Hour: IDL.Null,
    Minute: IDL.Null,
  });
  const Frequency = IDL.Record({ n: IDL.Nat, period: Period });
  const GetAttributeDescription = IDL.Record({
    id: AttributeId,
    status: Status,
    name: IDL.Text,
    description: IDL.Opt(IDL.Text),
    polling_frequency: IDL.Opt(Frequency),
  });
  const MetricsError = IDL.Variant({
    FailedExecution: IDL.Null,
    InvalidId: IDL.Null,
    AttributePaused: IDL.Null,
    FailedGettingValue: IDL.Null,
    Unauthorized: IDL.Null,
  });
  const Result = IDL.Variant({ ok: AttributeId, err: MetricsError });
  const MetricsResponse = Result;
  const GetPeriod = IDL.Variant({
    Day: IDL.Null,
    Hour: IDL.Null,
    Week: IDL.Null,
    Minute: IDL.Null,
  });
  const GetRequest = IDL.Record({
    period: IDL.Opt(GetPeriod),
    limit: IDL.Opt(IDL.Nat),
    before: IDL.Opt(IDL.Int),
    attributeId: AttributeId,
  });
  const AttributeDescription = IDL.Record({
    name: IDL.Text,
    description: IDL.Opt(IDL.Text),
    polling_frequency: IDL.Opt(Frequency),
    getter: IDL.Func([], [IDL.Int], ["query"]),
  });
  const TimeSeries = IDL.Record({ value: IDL.Int, timestamp: IDL.Int });
  const AttributeRecord = IDL.Record({
    id: AttributeId,
    status: Status,
    principal: IDL.Principal,
    description: AttributeDescription,
    series: IDL.Vec(TimeSeries),
  });
  const Result_2 = IDL.Variant({
    ok: AttributeRecord,
    err: MetricsError,
  });
  const TrackerRequest = IDL.Record({
    action: IDL.Variant({
      Set: AttributeDescription,
      Pause: IDL.Null,
      Unpause: IDL.Null,
      Delete: IDL.Null,
    }),
    attributeId: IDL.Opt(AttributeId),
  });
  const Metrics = IDL.Service({
    allActiveAttributes: IDL.Func(
      [],
      [IDL.Vec(GetAttributeDescription)],
      ["query"]
    ),
    attributesByPrincipal: IDL.Func(
      [IDL.Principal],
      [IDL.Vec(GetAttributeDescription)],
      ["query"]
    ),
    cycles: IDL.Func([], [IDL.Nat], ["query"]),
    execute: IDL.Func([AttributeId], [MetricsResponse], []),
    init: IDL.Func([], [IDL.Opt(AttributeId), IDL.Opt(AttributeId)], []),
    memory: IDL.Func([], [IDL.Nat], ["query"]),
    recordById: IDL.Func([GetRequest], [Result_2], ["query"]),
    track: IDL.Func([TrackerRequest], [MetricsResponse], []),
  });
  return Metrics;
};
export default Metrics;
export const init = ({ IDL }) => {
  return [];
};
