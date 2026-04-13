import type { DeviceState } from "../api/types";
import { useRoomControl } from "../hooks/useRoomControl";
import { BrightnessSlider } from "./BrightnessSlider";
import { TemperatureSlider } from "./TemperatureSlider";
import { ColorPicker } from "./ColorPicker";
import { SceneSelector } from "./SceneSelector";

interface WizLightControlsProps {
  roomId: string;
  devices: DeviceState[];
  onRefresh: () => void;
}

export function WizLightControls({ roomId, devices, onRefresh }: WizLightControlsProps) {
  const { pending, setBrightness, setColor, setTemperature, setScene } =
    useRoomControl(roomId, onRefresh);

  const isOn = devices.some((d) => d.state);
  const brightness = devices[0]?.brightness ?? 50;
  const temperature = devices[0]?.temperature ?? 4000;
  const color = devices[0]?.color ?? { r: 255, g: 255, b: 255 };

  const isDisabled = pending || devices.length === 0;

  return (
    <>
      <BrightnessSlider
        value={brightness}
        disabled={isDisabled || !isOn}
        onChange={setBrightness}
      />

      <div className="border-t border-zinc-800" />

      <TemperatureSlider
        value={temperature}
        disabled={isDisabled || !isOn}
        onChange={setTemperature}
      />

      <div className="border-t border-zinc-800" />

      <ColorPicker
        currentColor={color}
        disabled={isDisabled || !isOn}
        onColorChange={setColor}
      />

      <div className="border-t border-zinc-800" />

      <SceneSelector
        disabled={isDisabled || !isOn}
        onSceneSelect={setScene}
      />

      {/* Light Details */}
      {devices.length > 0 && (
        <>
          <div className="border-t border-zinc-800" />
          <div className="space-y-2">
            <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider">
              Light Details
            </p>
            <div className="grid gap-1.5">
              {devices.map((device) => (
                <div
                  key={device.ip}
                  className="flex items-center justify-between text-xs bg-zinc-800/50 rounded-lg px-3 py-2"
                >
                  <span className="font-mono text-zinc-500">{device.ip}</span>
                  <div className="flex items-center gap-3">
                    <span className={device.state ? "text-emerald-400" : "text-zinc-600"}>
                      {device.state ? "On" : "Off"}
                    </span>
                    {device.brightness != null && (
                      <span className="text-zinc-500">{device.brightness}%</span>
                    )}
                    {device.mode && (
                      <span className="text-zinc-600 capitalize">{device.mode}</span>
                    )}
                    <div
                      className="w-3 h-3 rounded-full border border-zinc-600"
                      style={{
                        backgroundColor: `rgb(${device.color.r},${device.color.g},${device.color.b})`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </>
  );
}
